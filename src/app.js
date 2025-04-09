const express = require('express')
const { validateInput } = require('./validation/requestValidator')
const constants = require('./res/constants')
const { evaluateEligibility } = require('./service/eligibilityService')
const { assembleEligibilityRequest } = require('./assemblers/requestAssembler')

const app = express()

app.use(express.json())

app.post('/eligibility', (req, res) => {
  try {
    validateInput(req.body)
    const payload = assembleEligibilityRequest(req.body)
    const response = evaluateEligibility(payload)
    return res.status(200).json(response)
  } catch (e) {
    if (e.status && e.erro) {
      return res.status(e.status).json({
        erro: e.erro,
        detalhe: e.detalhe,
      })
    }
    return res.status(500).json({ erro: constants.errorMessages.internalError })
  }
})

module.exports = app
