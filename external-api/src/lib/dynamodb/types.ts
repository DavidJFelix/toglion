import type {AttributeValue, DynamoDB} from '@aws-sdk/client-dynamodb'

export interface DynamoDBClientParams {
  client: DynamoDB
}

export interface DynamoDBTableNameParams {
  tableName: string
}

export interface DynamoDBParams
  extends DynamoDBClientParams,
    DynamoDBTableNameParams {}

export interface Key {
  type: string
  id: string
}

interface DynamoDBKey {
  [key: string]: AttributeValue
}

export interface EncodedKey extends DynamoDBKey {
  PartitionKey: AttributeValue.SMember
  SortKey: AttributeValue.SMember
}

export interface TimeStampFields {
  createdAt: Date
  modifiedAt: Date
}

export interface SoftDeleteFields {
  isDeleted: boolean
  deletedAt?: Date
}

export interface Entry<T> extends SoftDeleteFields, TimeStampFields {
  key?: Key
  sortKey?: Key
  value: T
}

export interface SoftDeleteOptions {
  isDeleted?: boolean
  deletedAt?: Date
}

export interface TimeToLiveOptions {
  timeToLiveInSeconds?: number
}

export interface InsertOrUpdateOptions
  extends SoftDeleteOptions,
    TimeToLiveOptions,
    Partial<TimeStampFields> {
  upsert?: boolean
}

export interface PutOptions
  extends SoftDeleteOptions,
    TimeToLiveOptions,
    Partial<TimeStampFields> {
  overwrite?: boolean
}
