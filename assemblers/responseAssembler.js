export const assembleEligibleClientResponse = totalEconomy => ({
  elegivel: true,
  economiaAnualDeCO2: totalEconomy
})

export const assembleIneligibleClientResponse = reasons => ({
  elegivel: false,
  razoesDeInelegibilidade: reasons
})
