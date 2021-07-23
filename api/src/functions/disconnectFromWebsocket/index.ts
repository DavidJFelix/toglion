import {handlerPath} from '@lib/handlerResolver'
import type {FunctionDefinition} from '@lib/serverless'

export const disconnectFromWebsocket: FunctionDefinition = {
  handler: `${handlerPath(__dirname)}/handler.disconnectFromWebsocket`,
  events: [
    {
      websocket: {
        route: '$disconnect',
      },
    },
  ],
}
