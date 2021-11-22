export const createSchema = {
  type: 'object',
  properties: {
    organizationId: {
      type: 'string',
    },
    path: {
      type: 'string',
    },
    value: {
      type: 'boolean',
    },
  },
  required: ['organizationId', 'path', 'value'],
} as const

export const updateSchema = {
  type: 'object',
  properties: {
    value: {
      type: 'boolean',
    },
  },
  required: ['value'],
} as const
