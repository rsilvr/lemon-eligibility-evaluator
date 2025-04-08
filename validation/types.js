const cpf = {
  type: 'string',
  pattern: '^\\d{11}$'
}

const cnpj = {
  type: 'string',
  pattern: '^\\d{14}$'
}

const connectionTypes = ['monofasico', 'bifasico', 'trifasico']

const consumptionClasses = [
  'residencial',
  'industrial',
  'comercial',
  'rural',
  'poderPublico',
]

const tariffScheme = ['azul', 'branca', 'verde', 'convencional']

export {
	cpf,
  cnpj,
  connectionTypes,
  consumptionClasses,
  tariffScheme,
}
