import type {DynamoDB} from '@aws-sdk/client-dynamodb'

export interface DynamoDBParams {
  client: DynamoDB
  tableName: string
}

export interface Key {
  type: string
  id: string
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
    TimeToLiveOptions {
  createdAt?: Date
  modifiedAt?: Date
  upsert?: boolean
}
