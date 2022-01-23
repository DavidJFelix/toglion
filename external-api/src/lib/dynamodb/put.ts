import {PutItemCommandInput} from '@aws-sdk/client-dynamodb'
import {
  encodeKeys,
  generateItemAttributeValueBooleans,
  generateItemAttributeValueStrings,
} from './utils'
import {DynamoDBTableNameParams, Entry, Key, PutOptions} from './types'
import {DynamoDBClientParams, generateDeletedAtItemAttributeValue} from '.'

export interface GeneratePutParams<T extends object>
  extends DynamoDBTableNameParams {
  key: Key
  sortKey?: Key
  value: T
  options?: PutOptions
}
export function generatePut<T extends object = object>({
  tableName,
  key,
  sortKey,
  value,
  options,
}: GeneratePutParams<T>): PutItemCommandInput {
  const now = new Date()
  const utcSecondsSinceEpoch =
    Math.round(now.getTime() / 1000) + now.getTimezoneOffset() * 60
  return {
    TableName: tableName,
    ConditionExpression:
      options?.overwrite !== undefined && options.overwrite
        ? undefined
        : 'attribute_not_exists(PartitionKey)',
    ReturnValues:
      options?.overwrite !== undefined && options.overwrite
        ? 'ALL_OLD'
        : undefined,
    Item: {
      ...encodeKeys(key, sortKey),
      ...generateItemAttributeValueStrings(
        ['CreatedAt', (options?.createdAt ?? now).toISOString()],
        ['ModifiedAt', (options?.modifiedAt ?? now).toISOString()],
        ['RawValue', JSON.stringify(value)],
      ),
      ...generateItemAttributeValueBooleans([
        'IsDeleted',
        options?.isDeleted ?? false,
      ]),
      ...generateDeletedAtItemAttributeValue({
        deletedAt: options?.deletedAt,
        isDeleted: options?.isDeleted,
        now,
      }),
      ...(options?.timeToLiveInSeconds !== undefined
        ? {
            TTL: {
              N: `${options.timeToLiveInSeconds + utcSecondsSinceEpoch}`,
            },
          }
        : {}),
    },
  }
}
export interface PutParams<T extends object>
  extends DynamoDBClientParams,
    GeneratePutParams<T> {}
export async function put<
  TOld extends object = object,
  TNew extends object = object,
>(params: PutParams<TNew>): Promise<Entry<TOld> | void> {
  const {client, options} = params
  const response = await client.putItem(generatePut(params))
  if (options?.overwrite !== undefined && options.overwrite) {
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
}
