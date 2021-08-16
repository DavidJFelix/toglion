import {DynamoDBParams, Entry, Key} from './types'
import {encodeKeys} from './utils'

export interface GetParams extends DynamoDBParams {
  key: Key
  sortKey?: Key
}
export async function get<T = object>({
  client,
  tableName,
  key,
  sortKey,
}: GetParams): Promise<Entry<T>> {
  const response = await client.getItem({
    TableName: tableName,
    Key: encodeKeys(key, sortKey),
  })
  return {
    createdAt: new Date(response.Item.CreatedAt.S),
    modifiedAt: new Date(response.Item.ModifiedAt.S),
    isDeleted: response.Item.IsDeleted.BOOL,
    value: JSON.parse(response.Item.RawValue.S),
  }
}
