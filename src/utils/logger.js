const winston = require('winston')

const format = winston.format.combine(
  winston.format.prettyPrint(),
  winston.format.errors({ stack: true })
)

module.exports = winston.createLogger({
  format,
  level: 'http',
  transports: [
    new winston.transports.Console()
  ],
  silent: process.env.SHOW_LOGS !== 'true'
})
