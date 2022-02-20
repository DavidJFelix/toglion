import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {config} from 'lib/config'
import {NewOrganization, Organization, UpdatedOrganization} from 'types'
import {ulid} from 'ulid'

export async function createOrganization(
  newOrg: NewOrganization,
): Promise<Organization> {
  const id = ulid()
  const ddbClient = new DynamoDB({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  const docDbClient = DynamoDBDocument.from(ddbClient)
  await docDbClient.transactWrite({
    TransactItems: [
      {
        Put: {
          TableName: config.dynamodb.organizations,
          ConditionExpression: 'attribute_not_exists(#i)',
          ExpressionAttributeNames: {
            '#i': 'id',
          },
          Item: {
            id,
            ...newOrg,
          },
        },
      },
      {
        Put: {
          TableName: config.dynamodb.organizations,
          ConditionExpression: 'attribute_not_exists(#i)',
          ExpressionAttributeNames: {
            '#i': 'id',
          },
          Item: {
            id: `unique/name/${newOrg.name}`,
          },
        },
      },
    ],
  })
  // FIXME: handle case where transact fails
  return {id, ...newOrg}
}

export interface DeleteOrganizationParams {
  organizationId: string
  requestingUserId: string
}
export async function deleteOrganization(id: string): Promise<void> {
  // TODO: implement
}

export interface GetOrganizationParams {
  organizationId: string
  requestingUserId: string
}
export async function getOrganization({
  organizationId,
  requestingUserId,
}: GetOrganizationParams): Promise<Organization | null> {
  const ddbClient = new DynamoDB({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  const docDbClient = DynamoDBDocument.from(ddbClient)
  const result = await docDbClient.get({
    TableName: config.dynamodb.organizations,
    Key: {
      id: organizationId,
    },
  })

  if (!result.Item) {
    return null
  }

  if (result.Item.ownerUserId !== requestingUserId) {
    return null
  }

  return result.Item as Organization
}

export interface ListOrganizationsParams {
  requestingUserId: string
}
export async function listOrganizations({
  requestingUserId,
}: ListOrganizationsParams): Promise<Organization[]> {
  const ddbClient = new DynamoDB({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  })
  const docDbClient = DynamoDBDocument.from(ddbClient)
  const result = await docDbClient.query({
    TableName: config.dynamodb.organizations,
    IndexName: 'owner-user',
    KeyConditionExpression: '#o = :o',
    ExpressionAttributeNames: {'#o': 'ownerUserId'},
    ExpressionAttributeValues: {':o': requestingUserId},
  })

  // FIXME: actually do real marshalling
  return (result.Items ?? []) as Organization[]
}

export async function updateOrganization(
  org: UpdatedOrganization,
): Promise<Organization> {
  // FIXME: implement
  return org as Organization
}
