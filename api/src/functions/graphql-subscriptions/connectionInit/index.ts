import {handlerPath} from '@lib/handlerResolver'
import type {FunctionDefinition} from '@lib/serverless'

export const connectionInit: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.connectionInit`,
  events: [
    {
      websocket: {
        route: 'connection_init',
        routeResponseSelectionExpression: '$default',
      },
    },
  ],
}
