import {handlerPath} from '@lib/handlerResolver'
import type {FunctionDefinition} from '@lib/serverless'

export const clientPing: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.clientPingPong`,
  events: [
    {
      websocket: {
        route: 'ping',
        routeResponseSelectionExpression: '$default',
      },
    },
  ],
}

export const clientPong: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.clientPingPong`,
  events: [
    {
      websocket: {
        route: 'pong',
        routeResponseSelectionExpression: '$default',
      },
    },
  ],
}
