import {BatchGetItemInput} from '@aws-sdk/client-dynamodb'
import {
  getInitialBatchItemInput,
  getKeyToBatchGetItemInputReducer,
  getPermissionsToBatchGetItem,
  getPermissionsToBatchGetItemWithCount,
  newResource,
  newSubject,
  newSubjectOrResource,
  Permission,
  permissionToKey,
} from '../utils'

test('newSubjectOrResource creates a new SubjectOrResource', () => {
  // Given
  const type = 'Test'
  const id = '1234'

  // When
  const result = newSubjectOrResource(type, id)

  // Then
  expect(result.id).toEqual(id)
  expect(result.type).toEqual(type)
  expect(result).toEqual({
    type,
    id,
  })
})

test('newSubject creates a new PermissionSubject', () => {
  // Given
  const type = 'Test'
  const id = '1234'

  // When
  const result = newSubject(type, id)

  // Then
  expect(result.id).toEqual(id)
  expect(result.type).toEqual(type)
  expect(result).toEqual({
    type,
    id,
  })
})

test('newResource creates a new PermissionResource', () => {
  // Given
  const type = 'Test'
  const id = '1234'

  // When
  const result = newResource(type, id)

  // Then
  expect(result.id).toEqual(id)
  expect(result.type).toEqual(type)
  expect(result).toEqual({
    type,
    id,
  })
})

test('permissionToKey maps a Permission object to a DynamoDB Key', () => {
  // Given
  const permission: Permission = {
    subject: {
      type: 'User',
      id: 'test',
    },
    action: 'passesTest',
    resource: {
      type: 'Test',
      id: 'this',
    },
  }

  // When
  const result = permissionToKey(permission)

  // Then
  expect(result).toEqual({
    '#PartitionKey': {
      S: 'permissionSubject#User/test',
    },
    '#SortKey': {
      S: 'permissionResource/permissionAction#Test/this/passesTest',
    },
  })
})

test('getKeyToBatchGetItemInputReducer returns a reducer that adds keys to the BatchGetItemInput Keys list under the table name specified for initial value', () => {
  // Given
  const tableName = 'TestTable'
  const acc: BatchGetItemInput = {
    RequestItems: {
      [tableName]: {
        Keys: [],
      },
    },
  }
  const key = {
    '#PartitionKey': {
      S: 'permissionSubject#User/test',
    },
    '#SortKey': {
      S: 'permissionResource/permissionAction#Test/this/passesTest',
    },
  }

  // When
  const reducer = getKeyToBatchGetItemInputReducer(tableName)
  const result = reducer(acc, key)

  // Then
  expect(typeof reducer).toEqual('function')
  expect(result).toEqual({
    RequestItems: {
      TestTable: {
        Keys: [
          {
            '#PartitionKey': {
              S: 'permissionSubject#User/test',
            },
            '#SortKey': {
              S: 'permissionResource/permissionAction#Test/this/passesTest',
            },
          },
        ],
      },
    },
  })
})

test('getKeyToBatchGetItemInputReducer returns a reducer that appends keys to the BatchGetItemInput Keys list under the table name specified for additional keys', () => {
  // Given
  const tableName = 'TestTable'
  const acc: BatchGetItemInput = {
    RequestItems: {
      [tableName]: {
        Keys: [
          {
            '#PartitionKey': {
              S: 'permissionSubject#User/test1',
            },
            '#SortKey': {
              S: 'permissionResource/permissionAction#Test/this1/passesTest',
            },
          },
        ],
      },
    },
  }
  const key = {
    '#PartitionKey': {
      S: 'permissionSubject#User/test2',
    },
    '#SortKey': {
      S: 'permissionResource/permissionAction#Test/this2/passesTest',
    },
  }

  // When
  const reducer = getKeyToBatchGetItemInputReducer(tableName)
  const result = reducer(acc, key)

  // Then
  expect(typeof reducer).toEqual('function')
  expect(result).toEqual({
    RequestItems: {
      TestTable: {
        Keys: [
          {
            '#PartitionKey': {
              S: 'permissionSubject#User/test1',
            },
            '#SortKey': {
              S: 'permissionResource/permissionAction#Test/this1/passesTest',
            },
          },
          {
            '#PartitionKey': {
              S: 'permissionSubject#User/test2',
            },
            '#SortKey': {
              S: 'permissionResource/permissionAction#Test/this2/passesTest',
            },
          },
        ],
      },
    },
  })
})

test('getInitialBatchItemInput returns a batch item with the table name populated', () => {
  // Given
  const tableName = 'TestTable'

  // When
  const result = getInitialBatchItemInput(tableName)

  // Then
  expect(result).toEqual({
    RequestItems: {
      TestTable: {
        Keys: [],
      },
    },
  })
})

test('getPermissionsToBatchGetItem returns a function which maps a Permission[] to BatchGetItemInput', () => {
  // Given
  const tableName = 'TestTable'
  const permissions: Permission[] = [
    {
      subject: {
        type: 'User',
        id: 'test1',
      },
      action: 'passesTest',
      resource: {
        type: 'Test',
        id: 'this1',
      },
    },
    {
      subject: {
        type: 'User',
        id: 'test2',
      },
      action: 'passesTest',
      resource: {
        type: 'Test',
        id: 'this2',
      },
    },
  ]

  // When
  const mapper = getPermissionsToBatchGetItem(tableName)
  const result = mapper(permissions)

  // Then
  expect(typeof mapper).toEqual('function')
  expect(result).toEqual({
    RequestItems: {
      TestTable: {
        Keys: [
          {
            '#PartitionKey': {
              S: 'permissionSubject#User/test1',
            },
            '#SortKey': {
              S: 'permissionResource/permissionAction#Test/this1/passesTest',
            },
          },
          {
            '#PartitionKey': {
              S: 'permissionSubject#User/test2',
            },
            '#SortKey': {
              S: 'permissionResource/permissionAction#Test/this2/passesTest',
            },
          },
        ],
      },
    },
  })
})

test('getPermissionsToBatchGetItemWithCount returns a function which maps a Permission[] to [BatchGetItemInput, number]', () => {
  // Given
  const tableName = 'TestTable'
  const permissions: Permission[] = [
    {
      subject: {
        type: 'User',
        id: 'test1',
      },
      action: 'passesTest',
      resource: {
        type: 'Test',
        id: 'this1',
      },
    },
    {
      subject: {
        type: 'User',
        id: 'test2',
      },
      action: 'passesTest',
      resource: {
        type: 'Test',
        id: 'this2',
      },
    },
  ]

  // When
  const mapper = getPermissionsToBatchGetItemWithCount(tableName)
  const result = mapper(permissions)

  // Then
  expect(typeof mapper).toEqual('function')
  expect(result).toEqual([
    {
      RequestItems: {
        TestTable: {
          Keys: [
            {
              '#PartitionKey': {
                S: 'permissionSubject#User/test1',
              },
              '#SortKey': {
                S: 'permissionResource/permissionAction#Test/this1/passesTest',
              },
            },
            {
              '#PartitionKey': {
                S: 'permissionSubject#User/test2',
              },
              '#SortKey': {
                S: 'permissionResource/permissionAction#Test/this2/passesTest',
              },
            },
          ],
        },
      },
    },
    2,
  ])
})

// FIXME: test assertAllPermissions

// FIXME: test assertAnyPermission
