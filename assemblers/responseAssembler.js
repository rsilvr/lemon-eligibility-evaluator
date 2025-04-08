export const assembleEligibleClientResponse = annualSavings => ({
  elegivel: true,
  economiaAnualDeCO2: annualSavings
})

export const assembleIneligibleClientResponse = reasons => ({
  elegivel: false,
  razoesDeInelegibilidade: reasons
})
