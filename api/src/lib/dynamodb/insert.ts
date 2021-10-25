import {UpdateItemCommandInput} from '@aws-sdk/client-dynamodb'
import {
  generateExpressionAttributeNames,
  generateExpressionAttributeValueBooleans,
  generateExpressionAttributeValueStrings,
} from '.'
import {
  DynamoDBClientParams,
  DynamoDBTableNameParams,
  Entry,
  InsertOrUpdateOptions,
  Key,
} from './types'
import {encodeKeys} from './utils'

export interface GenerateInsertParams<T extends object>
  extends DynamoDBTableNameParams {
  key: Key
  sortKey?: Key
  value: T
  options?: InsertOrUpdateOptions
}
export function generateInsert<T extends object = object>({
  tableName,
  key,
  sortKey,
  value,
  options,
}: GenerateInsertParams<T>): UpdateItemCommandInput {
  const now = new Date()
  const utcSecondsSinceEpoch =
    Math.round(now.getTime() / 1000) + now.getTimezoneOffset() * 60
  return {
    TableName: tableName,
    ConditionExpression:
      options?.upsert !== undefined && options.upsert
        ? undefined
        : 'attribute_not_exists(#PartitionKey)',
    ReturnValues:
      options?.upsert !== undefined && options.upsert ? 'ALL_OLD' : undefined,
    Key: encodeKeys(key, sortKey),
    ExpressionAttributeNames: {
      ...generateExpressionAttributeNames(
        'CreatedAt',
        'IsDeleted',
        'ModifiedAt',
        'PartitionKey',
        'RawValue',
        'TTL',
      ),
      ...(options?.deletedAt !== undefined ||
      (options?.isDeleted !== undefined && options.isDeleted)
        ? {'#DeletedAt': 'DeletedAt'}
        : {}),
    },
    ExpressionAttributeValues: {
      ...generateExpressionAttributeValueStrings(
        ['CreatedAt', (options?.createdAt ?? now).toISOString()],
        ['ModifiedAt', (options?.modifiedAt ?? now).toISOString()],
        ['RawValue', JSON.stringify(value)],
      ),
      ...generateExpressionAttributeValueBooleans([
        'IsDeleted',
        options?.isDeleted ?? false,
      ]),
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
  }
}

export interface InsertParams<T extends object>
  extends DynamoDBClientParams,
    GenerateInsertParams<T> {}
export async function insert<
  TOld extends object = object,
  TNew extends object = object,
>(params: InsertParams<TNew>): Promise<Entry<TOld> | void> {
  const {client, options} = params
  const response = await client.updateItem(generateInsert(params))
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
