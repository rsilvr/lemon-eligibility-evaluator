const express = require('express')
const logger = require('./utils/logger')
const { validateInput } = require('./validation/requestValidator')
const constants = require('./res/constants')
const { evaluateEligibility } = require('./service/eligibilityService')
const { assembleEligibilityRequest } = require('./assemblers/requestAssembler')

const app = express()

app.use(express.json())

app.use((req, res, next) => {
  logger.http(req.body, { method: req.method, url: req.url })
  next()
})

app.post('/eligibility', (req, res) => {
  validateInput(req.body)
  const payload = assembleEligibilityRequest(req.body)
  const response = evaluateEligibility(payload)
  return res.status(200).json(response)
})

app.use((err, req, res, next) => {
  if (err.status && err.erro) return res.status(err.status).json({ erro: err.erro, detalhe: err.detalhe })
  next(err)
})

app.use((err, req, res, _next) => {
  logger.error(logger.format.transform(err))
  if (err.name === 'SyntaxError') return res.status(400).json({ erro: constants.errorMessages.invalidRequest })
  return res.status(500).json({ erro: constants.errorMessages.internalError })
})

module.exports = app
