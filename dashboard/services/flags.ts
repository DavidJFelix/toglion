import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {config} from 'lib/config'
import {Flag, NewFlag} from 'types'
import {ulid} from 'ulid'

export interface CreateFlagParams {
  newFlag: NewFlag
  requestingUserId: string
}
export async function createFlag({
  newFlag,
  requestingUserId,
}: CreateFlagParams): Promise<Flag> {
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
            id: `unique/name/${newFlag.name}`,
          },
        },
      },
    ],
  })
  // FIXME: handle case where transact fails
  return {id, ...newFlag}
}
