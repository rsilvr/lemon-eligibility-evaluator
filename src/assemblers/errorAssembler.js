const assembleApiError = (erro, detalhe, status = 400) => ({
  erro,
  detalhe,
  status
})

module.exports = {
  assembleApiError
}
