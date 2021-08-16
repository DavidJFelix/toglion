import {getConfig} from '@lib/config'
import {client as dbClient} from '@lib/db/client'
import {insert} from '@lib/dynamodb/insert'
import {get} from '@lib/dynamodb/get'
import {v0Flag, v0FlagSubscription} from './types'
import {update} from '@lib/dynamodb'

export interface V0Flag {
  value: boolean
}

export interface CreateV0FlagParams {
  key: string
  value: boolean
}
export async function createV0Flag({key, value}: CreateV0FlagParams) {
  const config = getConfig()
  await insert({
    client: dbClient,
    tableName: config.globalDynamoDBTableName,
    key: {
      id: key,
      type: v0Flag,
    },
    value: {
      value,
    },
  })
}

export interface GetV0FlagParams {
  key: string
}
export async function getV0Flag({key}: GetV0FlagParams) {
  const config = getConfig()
  return await get<V0Flag>({
    client: dbClient,
    tableName: config.globalDynamoDBTableName,
    key: {
      id: key,
      type: v0Flag,
    },
  })
}

export interface UpdateV0FlagParams {
  key: string
  value: boolean
}
export async function updateV0Flag({key, value}: UpdateV0FlagParams) {
  const config = getConfig()
  return await update<V0Flag, V0Flag>({
    client: dbClient,
    tableName: config.globalDynamoDBTableName,
    key: {
      id: key,
      type: v0Flag,
    },
    value: {
      value,
    },
  })
}
