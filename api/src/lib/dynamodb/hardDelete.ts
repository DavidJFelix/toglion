import {DynamoDBParams, Entry, Key} from './types'

export interface HardDeleteParams extends DynamoDBParams {
  key: Key
  shouldExist?: boolean
}
export async function hardDelete<T = object>({
  client,
  tableName,
  key,
  shouldExist = false,
}: HardDeleteParams): Promise<Entry<T> | void> {
  const response = await client.deleteItem({
    TableName: tableName,
    Key: {
      PartitionKey: {
        S: `${key.type}/${key.id}`,
      },
      SortKey: {
        S: `${key.type}/${key.id}`,
      },
    },
    ...(shouldExist
      ? {
          ConditionExpression: 'attribute_exists(PartitionKey)',
          ReturnValues: 'ALL_OLD',
        }
      : {}),
  })
  return shouldExist
    ? {
        createdAt: new Date(response.Attributes.CreatedAt.S),
        isDeleted: response.Attributes.IsDeleted.BOOL,
        modifiedAt: new Date(response.Attributes.ModifiedAt.S),
        value: JSON.parse(response.Attributes.RawValue.S),
        deletedAt: response.Attributes.DeletedAt
          ? new Date(response.Attributes.DeletedAt.S)
          : new Date(),
      }
    : undefined
}
