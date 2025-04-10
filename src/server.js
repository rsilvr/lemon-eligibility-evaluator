const port = process.env.PORT || 3000
process.env.SHOW_LOGS ??= 'true'

const logger = require('./utils/logger')
const app = require('./app')

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
