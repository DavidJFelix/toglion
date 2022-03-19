import {config} from 'lib/config'
import {
  defaultClient as dynamodb,
  DynamoDBClient,
  generateExpressionAttributeNames,
  generateExpressionAttributeValues,
  generateUpdateExpression,
  timestamps,
} from 'lib/dynamodb'
import {Flag} from 'types'
import {ulid} from 'ulid'
import {NotAuthorized, NotFound} from './errors'
import {
  CreateResourceParams,
  ListResourceParams,
  ReadResourceParams,
  Resource,
  ResourceContext,
  UpdateResourceParams,
} from './resource'

export interface FlagServiceContext extends ResourceContext {
  organizationId: string
}

export interface GetByNameParams<
  TContext extends FlagServiceContext = FlagServiceContext,
> {
  name: string
  context: TContext
}

export interface FlagServiceParams {
  dynamoDBClient: DynamoDBClient
}
export class FlagService implements Resource<Flag, FlagServiceContext> {
  readonly dynamoDBClient: DynamoDBClient
  constructor({dynamoDBClient}: FlagServiceParams) {
    this.dynamoDBClient = dynamoDBClient
  }
  async create({
    new: newFlag,
    context: {requestingUserId},
  }: CreateResourceParams<Flag>): Promise<Flag> {
    const id = ulid()
    const newTimestamps = timestamps({})
    await this.dynamoDBClient.dynamoDBDocumentClient.transactWrite({
      TransactItems: [
        // TODO: pull this out to accommodate non-owner users
        {
          ConditionCheck: {
            TableName: config.dynamodb.organizations,
            ConditionExpression: '#o = :o',
            ExpressionAttributeNames: {
              '#o': 'ownerUserId',
            },
            ExpressionAttributeValues: {
              ':o': requestingUserId,
            },
            Key: {
              id: newFlag.organizationId,
            },
          },
        },
        {
          Put: {
            TableName: config.dynamodb.flags,
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: {
              id,
              ...newFlag,
              ...newTimestamps,
            },
          },
        },
        {
          Put: {
            TableName: config.dynamodb.flags,
            ConditionExpression: 'attribute_not_exists(#i)',
            ExpressionAttributeNames: {
              '#i': 'id',
            },
            Item: {
              id: `unique/organization/${newFlag.organizationId}/name/${newFlag.name}`,
            },
          },
        },
      ],
    })
    // FIXME: handle case where transact fails
    return {id, ...newFlag}
  }
  async get({
    id: flagId,
    context: {requestingUserId},
  }: ReadResourceParams): Promise<Flag> {
    const flag = await this.dynamoDBClient.dynamoDBDocumentClient.get({
      TableName: config.dynamodb.flags,
      Key: {
        id: flagId,
      },
    })

    if (!flag.Item) {
      throw new NotFound()
    }

    const organization = await this.dynamoDBClient.dynamoDBDocumentClient.get({
      TableName: config.dynamodb.organizations,
      Key: {
        id: flag.Item.organizationId,
      },
    })

    if (organization.Item!.ownerUserId !== requestingUserId) {
      throw new NotAuthorized()
    }

    return flag.Item as Flag
  }
  async getByName({
    name: flagName,
    context: {organizationId, requestingUserId},
  }: GetByNameParams): Promise<Flag> {
    const orgPromise = dynamodb.dynamoDBDocumentClient.get({
      TableName: config.dynamodb.organizations,
      Key: {
        id: organizationId,
      },
    })
    const flagPromise = dynamodb.dynamoDBDocumentClient.query({
      TableName: config.dynamodb.flags,
      IndexName: 'name-by-organization',
      KeyConditionExpression: '#o = :o AND #n = :n',
      ExpressionAttributeNames: {'#n': 'name', '#o': 'organizationId'},
      ExpressionAttributeValues: {':n': flagName, ':o': organizationId},
    })
    const [orgResult, flagResult] = await Promise.all([orgPromise, flagPromise])

    if (
      orgResult.Item?.ownerUserId !== requestingUserId ||
      (flagResult.Items ?? []).length < 1
    ) {
      throw new NotFound()
    }

    return flagResult.Items![0] as Flag
  }

  async list({
    //FIXME: list,
    context: {requestingUserId, organizationId},
  }: ListResourceParams<FlagServiceContext>): Promise<Flag[]> {
    const orgPromise = dynamodb.dynamoDBDocumentClient.get({
      TableName: config.dynamodb.organizations,
      Key: {
        id: organizationId,
      },
    })
    const resultPromise = dynamodb.dynamoDBDocumentClient.query({
      TableName: config.dynamodb.flags,
      IndexName: 'organization',
      KeyConditionExpression: '#o = :o',
      ExpressionAttributeNames: {'#o': 'organizationId'},
      ExpressionAttributeValues: {':o': organizationId},
    })

    const [org, result] = await Promise.all([orgPromise, resultPromise])
    if (org.Item!.ownerUserId !== requestingUserId) {
      throw new NotAuthorized()
    }

    // FIXME: actually do real marshalling
    return (result.Items ?? []) as Flag[]
  }
  async update({
    updated: flag,
    context: {requestingUserId},
  }: UpdateResourceParams<Flag>): Promise<Flag> {
    const oldFlag = await this.dynamoDBClient.dynamoDBDocumentClient.get({
      Key: {
        id: flag.id,
      },
      TableName: config.dynamodb.flags,
    })

    const ownerOrgId = (oldFlag.Item as Flag | undefined)?.organizationId
    if (ownerOrgId === undefined) {
      throw 'Organization ID not found on flag'
    }

    const {updatedAt} = timestamps({})
    const {id: _, ...newFlag} = flag

    await this.dynamoDBClient.dynamoDBDocumentClient.transactWrite({
      TransactItems: [
        {
          ConditionCheck: {
            ConditionExpression: '#o = :o',
            ExpressionAttributeNames: {
              '#o': 'ownerUserId',
            },
            ExpressionAttributeValues: {
              ':o': requestingUserId,
            },
            Key: {
              id: ownerOrgId,
            },
            TableName: config.dynamodb.organizations,
          },
        },
        {
          Update: {
            ExpressionAttributeNames: {
              ...generateExpressionAttributeNames(
                ...Object.keys(newFlag),
                'updatedAt',
              ),
            },
            ExpressionAttributeValues: {
              ...generateExpressionAttributeValues(...Object.entries(newFlag), [
                'updatedAt',
                updatedAt,
              ]),
            },
            Key: {
              id: flag.id,
            },
            TableName: config.dynamodb.flags,
            UpdateExpression: generateUpdateExpression(
              ...Object.keys({...newFlag, updatedAt}),
            ),
          },
        },
      ],
    })
    const updatedFlag = await this.dynamoDBClient.dynamoDBDocumentClient.get({
      TableName: config.dynamodb.flags,
      Key: {
        id: flag.id,
      },
    })
    return updatedFlag.Item as Flag
  }
  async delete({}): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
