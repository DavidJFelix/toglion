import 'source-map-support/register'

import {adaptFaasKitHandlerForLambda} from '@faaskit/adapter-aws-lambda'
import {compose} from '@faaskit/core'
import {getConfig} from '@lib/config'
import {createV0FlagSubscription} from '@lib/db/v0FlagSubscription'
import {
  APIGatewayProxyContext,
  APIGatewayWebsocketProxyMiddleware,
} from '@lib/middleware/apiGatewayWebsocketProxyMiddleware'
import {LoggingRecoveryMiddleware} from '@lib/middleware/loggingRecoveryMiddleware'
import {TimingLogMiddleware} from '@lib/middleware/timingLogMiddleware'

import {
  graphql,
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql'
import {logger} from '@lib/logging'
import {createV0Flag, getV0Flag, updateV0Flag} from '@lib/db/v0Flag'

export interface SubscribeEvent {
  id: string
  type: 'subscribe'
  payload: {
    operationName?: string | null
    query: string
    variables?: Record<string, unknown> | null
    extensions?: Record<string, unknown> | null
  }
}

export async function subscribeHandler(
  event: SubscribeEvent,
  {APIGatewayWebsocketProxy}: APIGatewayProxyContext,
): Promise<object> {
  logger.info('subscribe')
  const {awsRegion} = getConfig()
  const contextValue = {
    queryId: event.id,
    connectionId: APIGatewayWebsocketProxy.requestContext.connectionId,
    awsRegion,
    endpoint: `${APIGatewayWebsocketProxy.requestContext.domainName}/${APIGatewayWebsocketProxy.requestContext.stage}`,
  }
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        v0Flag: {
          args: {
            key: {
              description: 'The key of the v0 flag',
              type: GraphQLNonNull(GraphQLString),
            },
          },
          type: GraphQLString,
          resolve: async (_root, {key}, _context, _info) => {
            const flag = await getV0Flag({
              key,
            })
            return flag.value.value
          },
        },
      },
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: {
        createV0Flag: {
          args: {
            key: {
              description: 'The key of the v0 flag',
              type: GraphQLNonNull(GraphQLString),
            },
            value: {
              description: 'The value of the v0 flag',
              type: GraphQLNonNull(GraphQLBoolean),
            },
          },
          type: GraphQLString,
          resolve: async (_root, {key, value}, _context, _info) => {
            await createV0Flag({key, value})
          },
        },
        updateV0Flag: {
          args: {
            key: {
              description: 'The key of the v0 flag',
              type: GraphQLNonNull(GraphQLString),
            },
            value: {
              description: 'The value of the v0 flag',
              type: GraphQLNonNull(GraphQLBoolean),
            },
          },
          type: GraphQLString,
          resolve: async (_root, {key, value}, _context, _info) => {
            await updateV0Flag({
              key,
              value,
            })
          },
        },
      },
    }),
    subscription: new GraphQLObjectType({
      name: 'Subscription',
      fields: {
        v0Flag: {
          args: {
            key: {
              description: 'The key of the v0 flag',
              type: GraphQLNonNull(GraphQLString),
            },
          },
          type: GraphQLNonNull(GraphQLBoolean),
          resolve: async (_root, {key}, context, _info) => {
            await createV0FlagSubscription({
              queryId: context.queryId,
              key,
              connectionId: context.connectionId,
              awsRegion: context.awsRegion,
            })
            const flag = await getV0Flag({
              key,
            })
            return flag.value.value
          },
        },
      },
    }),
  })

  try {
    const result = await graphql({
      contextValue,
      schema,
      source: event.payload.query,
      variableValues: event.payload.variables,
    })
    logger.info(result)
    return {
      id: event.id,
      type: 'next',
      payload: result,
    }
  } catch (error) {
    logger.info({message: 'in the catch', error: error ?? 'empty'})
    throw error
  }
}

export const subscribe = compose(
  adaptFaasKitHandlerForLambda,
  LoggingRecoveryMiddleware,
  TimingLogMiddleware,
  APIGatewayWebsocketProxyMiddleware,
)(subscribeHandler)
