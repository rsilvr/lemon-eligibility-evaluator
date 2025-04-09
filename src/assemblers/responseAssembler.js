const assembleEligibleClientResponse = annualSavings => ({
  elegivel: true,
  economiaAnualDeCO2: annualSavings
})

const assembleIneligibleClientResponse = reasons => ({
  elegivel: false,
  razoesDeInelegibilidade: reasons
})

module.exports = {
  assembleEligibleClientResponse,
  assembleIneligibleClientResponse
}
