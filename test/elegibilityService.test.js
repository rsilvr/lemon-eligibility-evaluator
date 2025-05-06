const request = require('supertest')
const app = require('../src/app')

const validBody = ({ numeroDoDocumento = '12345678909', tipoDeConexao = 'bifasico', classeDeConsumo = 'comercial', 
  modalidadeTarifaria = 'convencional', historicoDeConsumo = [400, 500, 600] } = {}) => ({
  numeroDoDocumento,
  tipoDeConexao,
  classeDeConsumo,
  modalidadeTarifaria,
  historicoDeConsumo,
})

const invokeService = body => request(app).post('/eligibility').send(body)

describe('Eligibility API test', () => {
  test('Should validate input', () => checkInputValidations())
  test('Should check eligible consumption classes', async () => {
    const ineligibleConsumptionClasses = ['rural', 'poderPublico']
    await Promise.all(ineligibleConsumptionClasses.map(consumptionClass => {
      return invokeService(validBody({ classeDeConsumo: consumptionClass }))
      .expect(200, assembleIneligibleClientResponse(['Classe de consumo não aceita']))
    }))
  })
  test('Should check eligible tariff schemes', async () => {
    const ineligibleTariffSchemes = ['azul', 'verde']
    await Promise.all(ineligibleTariffSchemes.map(tariffScheme => {
      return invokeService(validBody({ modalidadeTarifaria: tariffScheme }))
      .expect(200, assembleIneligibleClientResponse(['Modalidade tarifária não aceita']))
    }))
  })
  test('Should check minimum consumption by connection type', async () => {
    const consumptionHistoryBelowMinimum = {
      monofasico: [200, 400, 500],
      bifasico: [300, 500, 600],
      trifasico: [600, 750, 800]
    }
    await Promise.all(Object.entries(consumptionHistoryBelowMinimum).map(([connectionType, consumptionHistory]) => {
      return invokeService(validBody({ tipoDeConexao: connectionType, historicoDeConsumo: consumptionHistory }))
      .expect(200, assembleIneligibleClientResponse(['Consumo muito baixo para tipo de conexão']))
    }))
  })
  test('Should return multiple reasons for ineligibility', async () => {
    const consumptionHistory = [200, 400, 500]
    const body = validBody({ 
      classeDeConsumo: 'rural', 
      modalidadeTarifaria: 'azul', 
      tipoDeConexao: 'monofasico', 
      historicoDeConsumo: consumptionHistory 
    })
    await invokeService(body)
    .expect((res) => res.body.razoesDeInelegibilidade.sort())
    .expect(200, assembleIneligibleClientResponse([
      'Classe de consumo não aceita', 
      'Consumo muito baixo para tipo de conexão',
      'Modalidade tarifária não aceita'
    ]))
  })
  test('Should evaluate eligible client and calculate its savings', async () => {
    await invokeService(validBody()).expect(200, assembleEligibleClientResponse(504))
  })
  test('Should calculate savings for different consumption histories', async () => {
    const consumptionHistories = [
      {
        consumptionHistory: [3878, 9760, 5976, 2797, 2481, 5731, 7538, 4392, 7859, 4160, 6941, 4597],
        expectedSavings: 5553.24
      },
      {
        consumptionHistory: [3878, 9760, 5976, 2797, 2481, 5731, 7538, 4392, 7859, 4160],
        expectedSavings: 5500.824
      },
      {
        consumptionHistory: [3800, 9760, 5970, 2790, 2400, 5700],
        expectedSavings: 5110.56
      }
    ]
    await Promise.all(consumptionHistories.map(({ consumptionHistory, expectedSavings }) => {
      return invokeService(validBody({ historicoDeConsumo: consumptionHistory }))
      .expect(200, assembleEligibleClientResponse(expectedSavings))
    }))
  })
})

const checkInputValidations = () => Promise.all([
  validateRequiredAndType(validBody, 'numeroDoDocumento'),
  validateInputError(validBody({ numeroDoDocumento: 'X' }), 'numeroDoDocumento deve corresponder ao padrão "^(\\d{11}|\\d{14})$"'),
  validateInputError(validBody({ numeroDoDocumento: '12345678911' }), 'CPF/CNPJ inválido'),
  validateInputError(validBody({ numeroDoDocumento: '12345678911123' }), 'CPF/CNPJ inválido'),
  validateRequiredAndType(validBody, 'tipoDeConexao'),
  validateEnum(validBody, 'tipoDeConexao', ['bifasico', 'monofasico', 'trifasico']),
  validateRequiredAndType(validBody, 'classeDeConsumo'),
  validateEnum(validBody, 'classeDeConsumo', ['comercial', 'industrial', 'poderPublico', 'residencial', 'rural']),
  validateRequiredAndType(validBody, 'modalidadeTarifaria'),
  validateEnum(validBody, 'modalidadeTarifaria', ['azul', 'branca', 'convencional', 'verde']),
  validateRequiredAndType(validBody, 'historicoDeConsumo', 'array'),
  validateInputError(validBody({ historicoDeConsumo: ['1'] }), 'historicoDeConsumo.0 deve ser um número inteiro'),
  validateInputError(validBody({ historicoDeConsumo: [-1] }), 'historicoDeConsumo.0 deve ser >= 0'),
  validateInputError(validBody({ historicoDeConsumo: [10000] }), 'historicoDeConsumo.0 deve ser <= 9999'),
  validateInputError(validBody({ historicoDeConsumo: [1, 2] }), 'historicoDeConsumo não deve ter menos que 3 elementos'),
  validateInputError(validBody({ historicoDeConsumo: Array(13).fill(0) }), 'historicoDeConsumo não deve ter mais que 12 elementos'),
])

const possibleTypes = {
  string: 'x', 
  number: 1,
  boolean: true,
  object: {}, 
  array: [1, 2, 3]
}

const typeTranslations = {
  string: 'um texto',
  number: 'um número inteiro',
  array: 'array'
}

const validateRequiredAndType = async (payloadGenerator, key, expectedType = 'string') => {
  await Promise.all([
    validateRequired(payloadGenerator, key),
    validateType(payloadGenerator, key, expectedType)
  ])
}

const validateRequired = async (payloadGenerator, key) => {
  const payload = payloadGenerator()
  const invalidPayload = { ...payload }
  delete invalidPayload[key]
  const expectedError = `body deve ter a propriedade obrigatória ${key}`
  return validateInputError(invalidPayload, expectedError)
}

const validateType = async (payloadGenerator, key, expectedType) => {
  await Promise.all(Object.keys(possibleTypes).filter(type => type !== expectedType).map(type => {
    const payload = payloadGenerator()
    const invalidPayload = { ...payload }
    invalidPayload[key] = possibleTypes[type]
    const typeTranslation = typeTranslations[expectedType]
    const expectedError = `${key} deve ser ${typeTranslation}`
    return validateInputError(invalidPayload, expectedError)
  }))
}

const validateEnum = async (payloadGenerator, key, allowedValues) => {
  const payload = payloadGenerator()
  const invalidPayload = { ...payload }
  invalidPayload[key] = 'invalidValue'
  const expectedError = `${key} deve ser igual a um dos valores permitidos (${allowedValues.join(', ')})`
  return validateInputError(invalidPayload, expectedError)
}

const validateInputError = (payload, expectedError) => {
  return invokeService(payload).expect(400)
  .expect(res => {
    expect(res.body.erro).toBe('Requisição inválida')
    expect(res.body.detalhe).toContain(expectedError)
  })
}

const assembleEligibleClientResponse = annualSavings => ({
  elegivel: true,
  economiaAnualDeCO2: annualSavings
})

const assembleIneligibleClientResponse = reasons => ({
  elegivel: false,
  razoesDeInelegibilidade: reasons
})
