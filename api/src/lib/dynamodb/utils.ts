import {EncodedKey, Key} from './types'

export class InvalidKeyStringError extends Error {}

export function stringifyKey(key: Key): string {
  return `${key.type}/${key.id}`
}

export function parseKey(key: string): Key {
  const keyParts = key.split('/')
  if (keyParts.length !== 2) {
    throw new InvalidKeyStringError(
      `Incorrect number of key parts: ${keyParts.length}; key: ${key}; must contain 1 "/" between 2 parts`,
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
      S: `${partitionKey.type}/${partitionKey.id}`,
    },
    SortKey: {
      S:
        sortKey !== undefined
          ? `${sortKey.type}/${sortKey.id}`
          : `${partitionKey.type}/${partitionKey.id}`,
    },
  }
}
