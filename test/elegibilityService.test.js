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
      'Modalidade tarifária não aceita', 
      'Classe de consumo não aceita', 
      'Consumo muito baixo para tipo de conexão'
    ].sort()))
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

const assembleEligibleClientResponse = annualSavings => ({
  elegivel: true,
  economiaAnualDeCO2: annualSavings
})

const assembleIneligibleClientResponse = reasons => ({
  elegivel: false,
  razoesDeInelegibilidade: reasons
})
