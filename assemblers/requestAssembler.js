export const assembleEligibilityRequest = body => ({
  document: body.numeroDoDocumento,
  connectionType: body.tipoDeConexao,
  consumptionClass: body.classeDeConsumo,
  tariffScheme: body.modalidadeTarifaria,
  consumptionHistory: body.historicoDeConsumo,
})
