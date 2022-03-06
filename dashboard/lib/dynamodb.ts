import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocument} from '@aws-sdk/lib-dynamodb'
import {config} from './config'

export const dynamoDbClient = new DynamoDB({
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
})
export const dynamoDbDocumentClient = DynamoDBDocument.from(dynamoDbClient)

export interface DynamoDBTimestamps {
  createdAt: string
  updatedAt: string
}
export interface TimestampsParams {
  createdAt?: Date | string
}
export function timestamps({createdAt}: TimestampsParams): DynamoDBTimestamps {
  const now = new Date().toISOString()
  let normalizedCreatedAt: string
  if (createdAt !== undefined && createdAt !== null) {
    if (typeof createdAt === 'string') {
      normalizedCreatedAt = createdAt
    } else if (createdAt instanceof Date) {
      normalizedCreatedAt = createdAt.toISOString()
    } else {
      normalizedCreatedAt = now
    }
  } else {
    normalizedCreatedAt = now
  }

  return {
    createdAt: normalizedCreatedAt,
    updatedAt: now,
  }
}

export function generateExpressionAttributeNames(
  ...names: string[]
): Record<string, string> {
  return names.reduce(
    (acc, name) => ({...acc, [`#${name}`]: name}),
    {} as Record<string, string>,
  )
}

export function generateExpressionAttributeValues(
  ...eavPairs: [string, unknown][]
): Record<string, unknown> {
  return eavPairs.reduce(
    (acc, [name, value]) => ({...acc, [`:${name}`]: value}),
    {} as Record<string, unknown>,
  )
}

export function generateUpdateExpression(...names: string[]): string {
  return `SET ${names.map((name) => `#${name} = :${name}`).join(', ')}`
}
