import 'source-map-support/register'

import {getConfig} from '@lib/config'
import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {update} from '@lib/dynamodb/update'
import {LoggingRecoveryMiddleware} from '@lib/middleware/loggingRecoveryMiddleware'
import {TimingLogMiddleware} from '@lib/middleware/timingLogMiddleware'
import {adaptFaasKitHandlerForLambda} from '@faaskit/adapter-aws-lambda'
import {compose} from '@faaskit/core'
import {
  APIGatewayProxyContext,
  APIGatewayWebsocketProxyMiddleware,
} from '@lib/middleware/apiGatewayWebsocketProxyMiddleware'

export interface PingPongEvent {
  type: 'ping' | 'pong'
}
export interface PongResponse {
  type: 'pong'
}

async function clientPingPongHandler(
  {type}: PingPongEvent,
  {APIGatewayWebsocketProxy}: APIGatewayProxyContext,
): Promise<PongResponse | void> {
  const config = getConfig()
  const dbClient = new DynamoDB({})

  const connectionId = APIGatewayWebsocketProxy.requestContext.connectionId
  if (connectionId === undefined) {
    throw new Error('no connection id on client ping')
  }
  await update({
    client: dbClient,
    tableName: config.regionalDynamoDBTableName,
    key: {
      id: connectionId,
      type: 'wsConnection',
    },
    options: {timeToLiveInSeconds: 3600},
    value: {},
  })

  if (type === 'ping') {
    return {
      type: 'pong',
    }
  }
  return
}

export const clientPingPong = compose(
  adaptFaasKitHandlerForLambda,
  LoggingRecoveryMiddleware,
  TimingLogMiddleware,
  APIGatewayWebsocketProxyMiddleware,
)(clientPingPongHandler)
