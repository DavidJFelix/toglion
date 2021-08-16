import {getConfig} from '@lib/config'
import {client as dbClient} from '@lib/db/client'
import {insert} from '@lib/dynamodb/insert'
import {query} from '@lib/dynamodb/query'
import {v0FlagSubscription, wsConnection} from './types'

export interface V0FlagSubscription {
  queryId: string
  key: string
  connectionId: string
  awsRegion: string
  endpoint: string
}

export interface CreateV0FlagSubscriptionParams {
  queryId: string
  key: string
  connectionId: string
  awsRegion: string
  endpoint: string
}
export async function createV0FlagSubscription({
  key,
  awsRegion,
  connectionId,
  endpoint,
}: CreateV0FlagSubscriptionParams) {
  const config = getConfig()
  await insert({
    client: dbClient,
    tableName: config.regionalDynamoDBTableName,
    key: {
      id: key,
      type: v0FlagSubscription,
    },
    sortKey: {
      id: connectionId,
      type: wsConnection,
    },
    value: {
      awsRegion,
      connectionId,
      endpoint,
    },
  })
}

export interface ListV0FlagSubscriptionsParams {
  key: string
}
export async function listV0FlagSubscriptions({
  key,
}: ListV0FlagSubscriptionsParams) {
  const config = getConfig()
  return await query<V0FlagSubscription>({
    client: dbClient,
    tableName: config.regionalDynamoDBTableName,
    key: {
      id: key,
      type: v0FlagSubscription,
    },
    sortKeyBeginsWith: wsConnection,
  })
}
