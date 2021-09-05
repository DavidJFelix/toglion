import {DynamoDBParams, Entry, InsertOrUpdateOptions, Key} from './types'
import {encodeKeys} from './utils'

export interface InsertParams<T> extends DynamoDBParams {
  key: Key
  sortKey?: Key
  value: T
  options?: InsertOrUpdateOptions
}
export async function insert<TOld = object, TNew = object>({
  client,
  tableName,
  key,
  sortKey,
  value,
  options,
}: InsertParams<TNew>): Promise<Entry<TOld> | void> {
  const now = new Date()
  const utcSecondsSinceEpoch =
    Math.round(now.getTime() / 1000) + now.getTimezoneOffset() * 60
  const response = await client.updateItem({
    TableName: tableName,
    ConditionExpression:
      options?.upsert !== undefined && options.upsert
        ? undefined
        : 'attribute_not_exists(PartitionKey)',
    ReturnValues:
      options?.upsert !== undefined && options.upsert ? 'ALL_OLD' : undefined,
    Key: encodeKeys(key, sortKey),
    ExpressionAttributeNames: {
      '#RawValue': 'RawValue',
      '#CreatedAt': 'CreatedAt',
      '#ModifiedAt': 'ModifiedAt',
      ...(options?.deletedAt !== undefined ||
      (options?.isDeleted !== undefined && options.isDeleted)
        ? {'#DeletedAt': 'DeletedAt'}
        : {}),
      '#IsDeleted': 'IsDeleted',
      '#TTL': 'TTL',
    },
    ExpressionAttributeValues: {
      ':RawValue': {
        S: JSON.stringify(value),
      },
      ':CreatedAt': {
        S: options?.createdAt?.toISOString() ?? now.toISOString(),
      },
      ':ModifiedAt': {
        S: options?.modifiedAt?.toISOString() ?? now.toISOString(),
      },
      ...(options?.deletedAt !== undefined
        ? {
            ':DeletedAt': {
              S: options.deletedAt.toISOString(),
            },
          }
        : options?.isDeleted !== undefined && options.isDeleted
        ? {
            ':DeletedAt': {
              S: now.toISOString(),
            },
          }
        : {}),
      ':IsDeleted': {
        BOOL: options?.isDeleted ?? false,
      },
      ...(options?.timeToLiveInSeconds !== undefined
        ? {
            ':TTL': {
              N: `${options.timeToLiveInSeconds + utcSecondsSinceEpoch}`,
            },
          }
        : {}),
    },
    UpdateExpression: `SET #RawValue = :RawValue, #ModifiedAt = :ModifiedAt, #IsDeleted = :IsDeleted, #CreatedAt = :CreatedAt${
      options?.isDeleted !== undefined && options.isDeleted
        ? ', #DeletedAt = :DeletedAt'
        : ''
    }${options?.timeToLiveInSeconds !== undefined ? ', #TTL = :TTL' : ''}${
      options?.timeToLiveInSeconds === undefined ? ' REMOVE #TTL' : ''
    }`,
  })
  if (options?.upsert !== undefined && options.upsert) {
    return {
      createdAt: new Date(response.Attributes!.CreatedAt.S!),
      modifiedAt: new Date(response.Attributes!.ModifiedAt.S!),
      isDeleted: response.Attributes!.IsDeleted.BOOL!,
      value: JSON.parse(response.Attributes!.RawValue.S!),
      deletedAt: response.Attributes!.DeletedAt
        ? new Date(response.Attributes!.DeletedAt.S!)
        : undefined,
    }
  }
  return
}
