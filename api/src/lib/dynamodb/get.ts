import {DynamoDBParams, Entry, Key} from './types'

export interface GetParams extends DynamoDBParams {
  key: Key
}
export async function get<T = object>({
  client,
  tableName,
  key,
}: GetParams): Promise<Entry<T>> {
  const response = await client.getItem({
    TableName: tableName,
    Key: {
      PartitionKey: {
        S: `${key.type}/${key.id}`,
      },
      SortKey: {
        S: `${key.type}/${key.id}`,
      },
    },
  })
  return {
    createdAt: new Date(response.Item.CreatedAt.S),
    modifiedAt: new Date(response.Item.ModifiedAt.S),
    isDeleted: response.Item.IsDeleted.BOOL,
    value: JSON.parse(response.Item.RawValue.S),
  }
}
