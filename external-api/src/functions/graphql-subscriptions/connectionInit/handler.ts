import 'source-map-support/register'

import {DynamoDB} from '@aws-sdk/client-dynamodb'
import {adaptFaasKitHandlerForLambda} from '@faaskit/adapter-aws-lambda'
import {compose} from '@faaskit/core'
import {getConfig} from '@lib/config'
import {update} from '@lib/dynamodb/update'
import {
  APIGatewayProxyContext,
  APIGatewayWebsocketProxyMiddleware,
} from '@lib/faas/middlewares/apiGatewayWebsocketProxyMiddleware'
import {LoggingRecoveryMiddleware} from '@lib/faas/middlewares/loggingRecoveryMiddleware'
import {TimingLogMiddleware} from '@lib/faas/middlewares/timingLogMiddleware'

export interface ConnectionInitEvent {
  type: 'connection_init'
}
export interface ConnectionAckResponse {
  type: 'connection_ack'
}

async function connectionInitHandler(
  _event: ConnectionInitEvent,
  {APIGatewayWebsocketProxy}: APIGatewayProxyContext,
): Promise<ConnectionAckResponse> {
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

  return {
    type: 'connection_ack',
  }
}

export const connectionInit = compose(
  adaptFaasKitHandlerForLambda,
  LoggingRecoveryMiddleware,
  TimingLogMiddleware,
  APIGatewayWebsocketProxyMiddleware,
)(connectionInitHandler)
