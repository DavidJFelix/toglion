import { handleRequest } from './handler'

export class FeatureFlagListener implements DurableObject {
  private state: DurableObjectState
  private env: Record<string, unknown>
  constructor(state: DurableObjectState, env: Record<string, unknown>) {
    this.state = state
    this.env = env
  }

  async fetchA(request: Request): Promise<Response> {
    const upgradeHeader = request.headers.get('Upgrade')
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 })
    }

    const [client, server] = Object.values(new WebSocketPair())

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  }

  async fetch(request: Request): Promise<Response> {
    const value = (this.env.KV as KVNamespace).get('Test')
    return new Response(value, { status: 200 })
  }
}
