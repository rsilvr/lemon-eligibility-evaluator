import express, { json } from 'express'
import { validateInput } from './validation/requestValidator.js'

const app = express()
const port = process.env.PORT || 3000

app.use(json())

app.post('/eligibility', (req, res) => {
  const result = validateInput(req.body)
  if (result) {
    return res.status(result.status).json({
      message: result.message,
      errors: result.errors,
    })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
