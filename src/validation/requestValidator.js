const Ajv = require('ajv')
const localize = require('ajv-i18n')
const { connectionTypes, consumptionClasses, tariffScheme } = require('../res/constants')
const { assembleApiError } = require('../assemblers/errorAssembler')
const constants = require('../res/constants')

const ajv = new Ajv({ allErrors: true })

const enumOf = values => ({
  type: typeof values[0],
  enum: values
})

const localizeErrors = errors => localize['pt-BR'](errors)

const requestBodySchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'numeroDoDocumento',
    'tipoDeConexao',
    'classeDeConsumo',
    'modalidadeTarifaria',
    'historicoDeConsumo',
  ],
  properties: {
    numeroDoDocumento: { 
      type: 'string',
      pattern: '^(\\d{11}|\\d{14})$'
    },
    tipoDeConexao: enumOf(Object.values(connectionTypes)),
    classeDeConsumo: enumOf(Object.values(consumptionClasses)),
    modalidadeTarifaria: enumOf(Object.values(tariffScheme)),
    historicoDeConsumo: {
      type: 'array',
      minItems: 3,
      maxItems: 12,
      items: {
        type: 'integer',
        minimum: 0,
        maximum: 9999,
      },
    }
  }
}

const schemaValidator = ajv.compile(requestBodySchema)

const validateInput = body => {
  const isValid = schemaValidator(body)
  if (!isValid) {
    localizeErrors(schemaValidator.errors)
    throw assembleApiError(constants.errorMessages.invalidRequest, schemaValidator.errors.map(error => {
      const field = error.instancePath.slice(1).split('/').join('.') || 'body'
      return `${field} ${error.message}`
    }))
  }
}

module.exports = {
  validateInput
}
