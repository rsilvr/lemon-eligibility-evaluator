import { assembleEligibleClientResponse, assembleIneligibleClientResponse } from '../assemblers/responseAssembler.js'
import constants from '../res/constants.js'

const { connectionTypes, consumptionClasses, tariffScheme, ineligibilityReasons, co2SavingInGramsByKWh } = constants

const eligibleConsumptionClasses = [
  consumptionClasses.comercial,
  consumptionClasses.residencial,
  consumptionClasses.industrial
]

const eligibleTariffSchemes = [
  tariffScheme.convencional,
  tariffScheme.branca
]

const minimumConsumptionByConnectionType = {
  [connectionTypes.monofasico]: 400,
  [connectionTypes.bifasico]: 500,
  [connectionTypes.trifasico]: 750
}

export const evaluateEligibility = payload => {
  const reasons = []
  if (!eligibleConsumptionClasses.includes(payload.consumptionClass)) {
    reasons.push(ineligibilityReasons.ineligibleConsumptionClass)
  }
  if (!eligibleTariffSchemes.includes(payload.tariffScheme)) {
    reasons.push(ineligibilityReasons.ineligibleTariffScheme)
  }
  const meanConsumption = calculateMeanConsumption(payload.consumptionHistory)
  if (!isConsumptionSufficient(payload.connectionType, meanConsumption)) {
    reasons.push(ineligibilityReasons.lowConsumptionForConnectionType)
  }
  if (reasons.length > 0) return assembleIneligibleClientResponse(reasons)
  const annualSavings = calculateCO2AnnualSavingsInKg(meanConsumption)
  return assembleEligibleClientResponse(annualSavings)
}

const calculateMeanConsumption = consumptionHistory => consumptionHistory.reduce((a, b) => a + b, 0) / consumptionHistory.length

const isConsumptionSufficient = (connectionType, meanConsumption) => {
  const minimumConsumption = minimumConsumptionByConnectionType[connectionType]
  return meanConsumption >= minimumConsumption
}

const calculateCO2AnnualSavingsInKg = meanConsumption => {
  const annualConsumption = Math.round(meanConsumption * 12)
  const totalSavings = annualConsumption * co2SavingInGramsByKWh
  return totalSavings / 1000
}
