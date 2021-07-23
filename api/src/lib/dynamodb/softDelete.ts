import {DynamoDBParams, Entry, Key, TimeToLiveOptions} from './types'

export interface SoftDeleteParams extends DynamoDBParams {
  key: Key
  options?: TimeToLiveOptions
}
export async function softDelete<T = object>({
  client,
  tableName,
  key,
  options,
}: SoftDeleteParams): Promise<Entry<T>> {
  const now = new Date()
  const response = await client.updateItem({
    TableName: tableName,
    Key: {
      PartitionKey: {
        S: `${key.type}/${key.id}`,
      },
      SortKey: {
        S: `${key.type}/${key.id}`,
      },
    },
    ExpressionAttributeNames: {
      '#DeletedAt': 'DeletedAt',
      '#IsDeleted': 'IsDeleted',
      '#ModifiedAt': 'ModifiedAt',
      ...(options.timeToLiveInSeconds !== undefined
        ? {
            '#TTL': 'TTL',
          }
        : {}),
    },
    ExpressionAttributeValues: {
      ':DeletedAt': {
        S: now.toISOString(),
      },
      ':IsDeleted': {
        BOOL: true,
      },
      ':ModifiedAt': {
        S: now.toISOString(),
      },
      ...(options.timeToLiveInSeconds !== undefined
        ? {
            ':TTL': {
              N: `${options.timeToLiveInSeconds}`,
            },
          }
        : {}),
    },
    ConditionExpression: 'attribute_exists(PartitionKey)',
    UpdateExpression: `SET #IsDeleted = :IsDeleted, #ModifiedAt = :ModifiedAt, #DeletedAt = :DeletedAt${
      options?.timeToLiveInSeconds !== undefined ? ', #TTL = :TTL' : ''
    }`,
  })
  return {
    createdAt: new Date(response.Attributes.CreatedAt.S),
    isDeleted: response.Attributes.IsDeleted.BOOL,
    modifiedAt: new Date(response.Attributes.ModifiedAt.S),
    value: JSON.parse(response.Attributes.RawValue.S),
    deletedAt: response.Attributes.DeletedAt
      ? new Date(response.Attributes.DeletedAt.S)
      : new Date(),
  }
}
