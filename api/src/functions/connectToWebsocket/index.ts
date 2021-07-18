import {handlerPath} from '@lib/handlerResolver'

export const connectToWebsocket = {
  handler: `${handlerPath(__dirname)}/handler.connectToWebsocket`,
  events: [
    {
      websocket: {
        route: '$connect',
      },
    },
  ],
}
