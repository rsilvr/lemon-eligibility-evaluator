module.exports = {
  errorMessages: {
    invalidRequest: 'Requisição inválida',
    internalError: 'Ocorreu um erro interno',
    invalidDocument: 'CPF/CNPJ inválido'
  },
  connectionTypes: {
    monofasico: 'monofasico', 
    bifasico: 'bifasico',
    trifasico: 'trifasico'
  },
  consumptionClasses: {
    residencial: 'residencial',
    industrial: 'industrial',
    comercial: 'comercial',
    rural: 'rural',
    poderPublico: 'poderPublico',
  },
  tariffScheme: {
    azul: 'azul', 
    branca: 'branca',
    verde: 'verde', 
    convencional: 'convencional'
  },
  ineligibilityReasons: {
    ineligibleConsumptionClass: 'Classe de consumo não aceita',
    ineligibleTariffScheme: 'Modalidade tarifária não aceita',
    lowConsumptionForConnectionType: 'Consumo muito baixo para tipo de conexão'
  },
  co2SavingInGramsByKWh: 84,
}
