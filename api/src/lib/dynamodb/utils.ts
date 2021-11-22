import {AttributeValue} from '@aws-sdk/client-dynamodb'
import {EncodedKey, Key} from './types'

export class InvalidKeyStringError extends Error {}

export interface CreateAssociationKeyParams {
  owner: string
  relation: string
  subject: string
}
export function createAssociationKey({
  owner,
  relation,
  subject,
}: CreateAssociationKeyParams) {
  return [owner, relation, subject].join('#')
}

export function stringifyKey(key: Key): string {
  return `${key.type}#${key.id}`
}

export function parseKey(key: string): Key {
  const keyParts = key.split('#')
  if (keyParts.length !== 2) {
    throw new InvalidKeyStringError(
      `Incorrect number of key parts: ${keyParts.length}; key: ${key}; must contain 1 "#" between 2 parts`,
    )
  }
  return {
    type: keyParts[0],
    id: keyParts[1],
  }
}

export function encodeKeys(partitionKey: Key, sortKey?: Key): EncodedKey {
  return {
    PartitionKey: {
      S: stringifyKey(partitionKey),
    },
    SortKey: {
      S:
        sortKey !== undefined
          ? stringifyKey(sortKey)
          : stringifyKey(partitionKey),
    },
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

export function generateExpressionAttributeNameIf(
  name: string,
  condition: boolean,
): Record<string, string> {
  return condition ? {[`#${name}`]: name} : {}
}

export function generateDateAttributeValue(date: Date): AttributeValue.SMember {
  return {
    S: date.toISOString(),
  }
}

export function generateExpressionAttributeValueStrings(
  ...eavPairs: [string, string][]
): Record<string, AttributeValue.SMember> {
  return eavPairs.reduce(
    (acc, [name, value]) => ({...acc, [`:${name}`]: {S: value}}),
    {} as Record<string, AttributeValue.SMember>,
  )
}

export function generateExpressionAttributeValueBooleans(
  ...eavPairs: [string, boolean][]
): Record<string, AttributeValue.BOOLMember> {
  return eavPairs.reduce(
    (acc, [name, value]) => ({...acc, [`:${name}`]: {BOOL: value}}),
    {} as Record<string, AttributeValue.BOOLMember>,
  )
}

export interface GenerateDeletedAtExpressionAttributeValueParams {
  deletedAt?: Date
  isDeleted?: boolean
  now: Date
}
export function generateDeletedAtExpressionAttributeValue({
  deletedAt,
  isDeleted,
  now,
}: GenerateDeletedAtItemAttributeValueParams): Record<
  string,
  AttributeValue.SMember
> {
  if (deletedAt !== undefined) {
    return {':DeletedAt': {S: deletedAt.toISOString()}}
  }

  if (isDeleted !== undefined && isDeleted) {
    return {':DeletedAt': {S: now.toISOString()}}
  }

  return {}
}

export function generateItemAttributeValueStrings(
  ...iavPairs: [string, string][]
): Record<string, AttributeValue.SMember> {
  return iavPairs.reduce(
    (acc, [name, value]) => ({...acc, [name]: {S: value}}),
    {} as Record<string, AttributeValue.SMember>,
  )
}

export function generateItemAttributeValueBooleans(
  ...eavPairs: [string, boolean][]
): Record<string, AttributeValue.BOOLMember> {
  return eavPairs.reduce(
    (acc, [name, value]) => ({...acc, [name]: {BOOL: value}}),
    {} as Record<string, AttributeValue.BOOLMember>,
  )
}

export interface GenerateDeletedAtItemAttributeValueParams {
  deletedAt?: Date
  isDeleted?: boolean
  now: Date
}
export function generateDeletedAtItemAttributeValue({
  deletedAt,
  isDeleted,
  now,
}: GenerateDeletedAtItemAttributeValueParams): Record<
  string,
  AttributeValue.SMember
> {
  if (deletedAt !== undefined) {
    return {DeletedAt: {S: deletedAt.toISOString()}}
  }

  if (isDeleted !== undefined && isDeleted) {
    return {DeletedAt: {S: now.toISOString()}}
  }

  return {}
}
