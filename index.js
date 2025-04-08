import express, { json } from 'express'
import { validateInput } from './validation/requestValidator.js'
import constants from './res/constants.js'
import { evaluateEligibility } from './service/eligibilityService.js'
import { assembleEligibilityRequest } from './assemblers/requestAssembler.js'

const app = express()
const port = process.env.PORT || 3000

app.use(json())

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
