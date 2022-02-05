export interface User {
  id: string
  email: string
  image: string
  alias?: string // TODO: Should be required, but isn't there yet
  name: string
}

export interface Organization {
  name: string
  id: string
  ownerUserId: string
}
