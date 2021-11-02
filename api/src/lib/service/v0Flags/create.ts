import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {getConfig} from '@lib/config'
import {organization, v0Flag} from '@lib/db/types'
import {transactWrite} from '@lib/dynamodb/transactWrite'

export interface CreateV0FlagParams {
  name: string
  description: string
  value: boolean
  ownerOrganizationId: string
}
export async function createV0Flag({
  name,
  description,
  value,
  ownerOrganizationId,
}: CreateV0FlagParams) {
  const {globalDynamoDBTableName} = getConfig()
  //FIXME: verify that user is a member of the owner organization and has write permission

  const client = new DynamoDB({})
  await transactWrite({
    inserts: [
      {
        key: {type: v0Flag, id: `${ownerOrganizationId}/${name}`},
        tableName: globalDynamoDBTableName,
        value: {value, name, description},
      },
      {
        key: {type: organization, id: ownerOrganizationId},
        sortKey: {type: v0Flag, id: name},
        tableName: globalDynamoDBTableName,
        value: {},
      },
    ],
    client,
  })
}
