import {logger} from '@lib/logging'

export const TimingLogMiddleware = (next) => async (event, context) => {
  const startTime = new Date().getTime()
  const result = await next(event, context)
  const endTime = new Date().getTime()
  const durationMs = endTime - startTime
  logger.info({durationMs})
  return result
}
