import {DynamoDBParams, Entry, Key} from './types'
import {encodeKeys, parseKey} from './utils'

export interface QueryParams extends DynamoDBParams {
  key: Key
  sortKeyBeginsWith?: string
}
export async function query<T = object>({
  client,
  tableName,
  key,
  sortKeyBeginsWith = '',
}: QueryParams): Promise<Entry<T>[]> {
  const response = await client.query({
    TableName: tableName,
    KeyConditionExpression:
      '#PartitionKey = :PartitionKey AND begins_with(#SortKey, :SortKey)',
    ExpressionAttributeNames: {
      '#PartitionKey': 'PartitionKey',
      '#SortKey': 'SortKey',
    },
    ExpressionAttributeValues: {
      ':PartitionKey': encodeKeys(key).PartitionKey,
      ':SortKey': {
        S: sortKeyBeginsWith,
      },
    },
  })
  return response.Items.map((it) => ({
    sortKey: parseKey(it.SortKey.S),
    createdAt: new Date(it.CreatedAt.S),
    modifiedAt: new Date(it.ModifiedAt.S),
    isDeleted: it.IsDeleted.BOOL,
    value: JSON.parse(it.RawValue.S),
  }))
}
