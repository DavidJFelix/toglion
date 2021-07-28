import {createLogger, format, transports} from 'winston'

export const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  handleExceptions: true,
  exitOnError: false,
  transports: [new transports.Console()],
})
