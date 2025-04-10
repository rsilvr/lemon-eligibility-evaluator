# Lemon Client Evaluation API

This application serves an API to evaluate if a client is eligible to acquire the services of Lemon Energy. In case of rejection, it returns the reasons for it. In case of acceptance, the clients is informed of the estimated annual savings of CO2 by using the service.

## Stack
- Node 22
- Express.js
- Jest

## Install and start the server

```shell
npm install
npm start
```

- By default the server starts at port 3000 at localhost, but this can be overridden passing an environment variable:

```shell
PORT=5000 npm start
```

## Tests

- You can run the tests by executing `npm test`

## Request example

`POST /eligibility`
```json
{
  "numeroDoDocumento": "14041737706", // CPF/CNPJ
  "tipoDeConexao": "bifasico", // monofasico/bifasico/trifasico
  "classeDeConsumo": "comercial", // residencial/industrial/comercial/rural/poderPublico
  "modalidadeTarifaria": "convencional", // azul/branca/verde/convencional,
  "historicoDeConsumo": [ // consumption in last 3-12 months in kWh
    3878,
    9760,
    5976
  ]
}
```

## Response example - Eligible client
```json
{
  "elegivel": true,
  "economiaAnualDeCO2": 5553.24
}
```

## Response example - Ineligible client
```json
{
  "elegivel": false,
  "razoesDeInelegibilidade": [
    "Classe de consumo não aceita",
    "Modalidade tarifária não aceita",
    "Consumo muito baixo para tipo de conexão"
  ]
}
```
