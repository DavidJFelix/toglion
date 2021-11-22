import {AuthContext} from '@lib/faas/contexts/auth'
import {createV0FlagHandler} from '../create'

test('createV0FlagHandler succeeds if user has permissions and the path does not exist', () => {
  // Given
  const authContext: AuthContext = {
    auth: {userId: '1234'},
  }
  const newFlag = {}
  // mocked functions

  // When
  const createPromise = createV0FlagHandler(newFlag, authContext)
})

test('creates read/write permission for v0 flag for user', () => {
  // FIXME: write this
  // expect(false).toBe(true)
})
