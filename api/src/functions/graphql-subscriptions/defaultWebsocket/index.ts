import {handlerPath} from '@lib/handlerResolver'
import type {FunctionDefinition} from '@lib/serverless'

export const defaultWebsocket: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.defaultWebsocket`,
  events: [
    {
      websocket: {
        route: '$default',
        routeResponseSelectionExpression: '$default',
      },
    },
  ],
}
