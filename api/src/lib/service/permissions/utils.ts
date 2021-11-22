import {AttributeValue, BatchGetItemInput} from '@aws-sdk/client-dynamodb'
import {getConfig} from '@lib/config'
import {client} from '@lib/db/client'
import {
  permissionAction as permissionActionType,
  permissionResource as permissionResourceType,
  permissionSubject as permissionSubjectType,
} from '@lib/db/types'
import {stringifyKey} from '@lib/dynamodb/utils'
import {chunk} from '@lib/util/chunk'

interface SubjectOrResource {
  type: string
  id: string
}

export type PermissionSubject = SubjectOrResource
export type PermissionResource = SubjectOrResource
export type PermissionAction = string

export interface Permission {
  subject: PermissionSubject
  action: PermissionAction
  resource: PermissionResource
}

function newSubjectOrResource(type: string, id: string): SubjectOrResource {
  return {
    type,
    id,
  }
}

export const newSubject = newSubjectOrResource
export const newResource = newSubjectOrResource

export function permissionToKey(
  permission: Permission,
): Record<string, AttributeValue> {
  return {
    '#PartitionKey': {
      S: stringifyKey({
        type: permissionSubjectType,
        id: `${permission.subject.type}/${permission.subject.id}`,
      }),
    },
    '#SortKey': {
      S: stringifyKey({
        type: `${permissionResourceType}/${permissionActionType}`,
        id: `${permission.resource.type}/${permission.resource.id}/${permission.action}`,
      }),
    },
  }
}

export function getKeyToBatchGetItemInputReducer(tableName: string) {
  return (
    acc: BatchGetItemInput,
    current: Record<string, AttributeValue>,
  ): BatchGetItemInput => ({
    ...acc,
    RequestItems: {
      [tableName]: {
        Keys: [...((acc?.RequestItems ?? {})[tableName]?.Keys ?? []), current],
      },
    },
  })
}

export function getInitialBatchItemInput(tableName: string): BatchGetItemInput {
  return {
    RequestItems: {
      [tableName]: {
        Keys: [],
      },
    },
  }
}

export function getPermissionsToBatchGetItem(tableName: string) {
  return (permissions: Permission[]): BatchGetItemInput =>
    permissions
      .map(permissionToKey)
      .reduce(
        getKeyToBatchGetItemInputReducer(tableName),
        getInitialBatchItemInput(tableName),
      )
}

export function getPermissionsToBatchGetItemWithCount(tableName: string) {
  return (permissions: Permission[]): [BatchGetItemInput, number] => [
    permissions
      .map(permissionToKey)
      .reduce(
        getKeyToBatchGetItemInputReducer(tableName),
        getInitialBatchItemInput(tableName),
      ),
    permissions.length,
  ]
}

export async function assertAllPermissions(...permissions: Permission[]) {
  const permissionsTableName = getConfig().globalDynamoDBTableName
  const chunkedPermissions = chunk(permissions, 100)
  const permissionPromises = chunkedPermissions
    .map(getPermissionsToBatchGetItemWithCount(permissionsTableName))
    .map(async ([input, itemCount]) => {
      const response = await client.batchGetItem(input)

      if (response.UnprocessedKeys !== undefined) {
        // TODO: handle some cases with Unprocessed Items and provisioned concurrency exceeded
        // TODO: develop an error strategy and use it here
        throw new Error(
          'Unprocessed items and provisioned concurrency exceeded',
        )
      }

      if (response.Responses![permissionsTableName].length === itemCount) {
        return true
      }

      // TODO: handle some cases with Unprocessed Items and provisioned concurrency exceeded
      // TODO: develop an error strategy and use it here
      throw new Error('No permissions from batch exist')
    })

  try {
    await Promise.all(permissionPromises)
  } catch (e) {
    // TODO: log?
    // TODO: develop error strategy and use it here
    throw new Error(`At least of the asserted permissions doesn't exist`)
  }
}

export async function assertAnyPermission(...permissions: Permission[]) {
  const permissionsTableName = getConfig().globalDynamoDBTableName
  const chunkedPermissions = chunk(permissions, 100)
  const permissionPromises = chunkedPermissions
    .map(getPermissionsToBatchGetItem(permissionsTableName))
    .map(async (input) => {
      const response = await client.batchGetItem(input)

      if (response.Responses![permissionsTableName].length > 0) {
        return true
      }

      // TODO: handle some cases with Unprocessed Items and provisioned concurrency exceeded
      // TODO: develop an error strategy and use it here
      throw new Error('No permissions from batch exist')
    })

  try {
    await Promise.any(permissionPromises)
  } catch (e) {
    // TODO: log?
    // TODO: develop error strategy and use it here
    throw new Error('None of the asserted permissions exist')
  }
}
