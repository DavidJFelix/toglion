export interface StringTimeStamps {
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  image: string
  alias?: string // TODO: Should be required, but isn't there yet
  name: string
}

export interface Flag {
  name: string
  id: string
  organizationId: string
  value: any // FIXME: actually define what type flags are for users
  schema: string
}

export interface BaseResource {
  id: string
}
export type NewResource<T extends BaseResource> = Omit<T, 'id'>
export type UpdatedResource<T extends BaseResource> = Partial<T> & Pick<T, 'id'>

export type NewFlag = NewResource<Flag>
export type UpdatedFlag = UpdatedResource<Flag>

export interface Organization {
  name: string
  id: string
  ownerUserId: string
}

export type NewOrganization = Omit<Organization, 'id'>
export type UpdatedOrganization = Partial<Organization> &
  Pick<Organization, 'id'>
