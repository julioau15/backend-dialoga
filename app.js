/*************************************************************************************
 * Objetivo: Arquivo responsável pela inicialização e configuração da API
 * Data: 00/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

// executar rodando:
// - npm install
// - npm run dev

// Import das funções
const {
    inserirNovaTabela2,
    atualizarTabela2,
    listarTabela2,
    buscarTabela2,
    excluirTabela2
} = require('./controller/tabela1/controllerTabela2.js')

// IMPORT das dependências para criar a API
const express = require('express')
const cors = require('cors')

const app = express()
const port = 8080

const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: ['Content-type', 'Autorization'] 
}

app.use(cors(corsOptions))

// ******** ROTAS ***********
// Import das rotas
const tabela1Router = require('./routes/tabela1.routes.js')

// tabela1
app.use('/v1/senai/tabela1', cors(), tabela1Router)

// inicializar a API para receber requisições
app.listen(port, () => {
    console.log(`API rodando em http://localhost:8080`)
})