import {AuthContext, useAuth} from '@lib/faas/contexts/auth'
import {
  assertAllPermissions,
  newResource,
  newSubject,
} from '@lib/service/permissions/utils'

export interface createV0FlagRequest {
  path: string
  organizationId: string
  value: boolean
}

export async function createV0FlagHandler(
  request: createV0FlagRequest,
  context: AuthContext,
) {
  const {userId} = useAuth(context)
  await assertAllPermissions({
    subject: newSubject('user', userId),
    action: 'createFlag',
    resource: newResource('organization', request.organizationId),
  })
  await createFlag({...request, createdByUserId: userId})
}
