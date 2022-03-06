import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {config} from 'lib/config'
import {
  dynamoDbDocumentClient,
  generateExpressionAttributeNames,
  generateExpressionAttributeValues,
  generateUpdateExpression,
  timestamps,
} from 'lib/dynamodb'
import {Flag, NewFlag} from 'types'
import {ulid} from 'ulid'
import {NotAuthorized, NotFound} from './errors'

export interface CreateFlagParams {
  newFlag: NewFlag
  requestingUserId: string
}
export async function createFlag({
  newFlag,
  requestingUserId,
}: CreateFlagParams): Promise<Flag> {
  const id = ulid()
  const newTimestamps = timestamps({})
  await dynamoDbDocumentClient.transactWrite({
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

export interface DeleteFlagParams {
  flagId: string
  requestingUserId: string
}
export async function deleteFlag({}: DeleteFlagParams): Promise<void> {
  // TODO
}

export interface ListFlagParams {
  organizationId: string
  requestingUserId: string
}
export async function listFlags({
  organizationId,
  requestingUserId,
}: ListFlagParams) {
  const ddbClient = new DynamoDB({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  const docDbClient = DynamoDBDocument.from(ddbClient)
  const orgPromise = docDbClient.get({
    TableName: config.dynamodb.organizations,
    Key: {
      id: organizationId,
    },
  })
  const resultPromise = docDbClient.query({
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

export interface GetFlagParams {
  flagId: string
  requestingUserId: string
}
export async function getFlag({flagId, requestingUserId}: GetFlagParams) {
  const ddbClient = new DynamoDB({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  const docDbClient = DynamoDBDocument.from(ddbClient)
  const flag = await docDbClient.get({
    TableName: config.dynamodb.flags,
    Key: {
      id: flagId,
    },
  })

  if (!flag.Item) {
    throw new NotFound()
  }

  const organization = await docDbClient.get({
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

export interface UpdateFlagParams {
  flag: Pick<Flag, 'id'> & Partial<Flag>
  requestingUserId: string
}
export async function updateFlag({flag, requestingUserId}: UpdateFlagParams) {
  const oldFlag = await dynamoDbDocumentClient.get({
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

  await dynamoDbDocumentClient.transactWrite({
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
}
