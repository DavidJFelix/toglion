import {APIGatewayProxyHandler} from 'aws-lambda'

export const connectToWebsocket: APIGatewayProxyHandler = async (event) => {
  return {statusCode: 200, body: JSON.stringify({message: 'ok', event})}
}
