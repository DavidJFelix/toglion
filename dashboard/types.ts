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
  value: unknown // FIXME: actually define what type flags are for users
}

export type NewFlag = Omit<Flag, 'id'>
export type UpdatedFlag = Partial<Flag> & Pick<Flag, 'id'>

export interface Organization {
  name: string
  id: string
  ownerUserId: string
}

export type NewOrganization = Omit<Organization, 'id'>
export type UpdatedOrganization = Partial<Organization> &
  Pick<Organization, 'id'>
