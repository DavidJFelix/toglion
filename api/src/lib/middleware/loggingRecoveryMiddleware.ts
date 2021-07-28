import {createRecoveryMiddleware} from '@faaskit/core'
import {logger} from '@lib/logging'

const sendError = async (error, _event, _context) => {
  logger.error(error)
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: `${error}`,
    }),
  }
}

export const LoggingRecoveryMiddleware = createRecoveryMiddleware(sendError)
