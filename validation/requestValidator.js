import Ajv from 'ajv'
import localize from 'ajv-i18n'
import { connectionTypes, consumptionClasses, tariffScheme, cpf, cnpj } from './types.js'
import { assembleApiError } from '../assemblers/errorAssembler.js'
import constants from '../res/constants.js'

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
      oneOf: [cpf, cnpj]
    },
    tipoDeConexao: enumOf(connectionTypes),
    classeDeConsumo: enumOf(consumptionClasses),
    modalidadeTarifaria: enumOf(tariffScheme),
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

export const validateInput = body => {
  const isValid = schemaValidator(body)
  if (!isValid) {
    localizeErrors(schemaValidator.errors)
    throw assembleApiError(400, constants.errorMessages.invalidRequest, schemaValidator.errors.map(error => {
      const field = error.instancePath.slice(1).split('/').join('.') || 'body'
      return `${field} ${error.message}`
    }))
  }
}
