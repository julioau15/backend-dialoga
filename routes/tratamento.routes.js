/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de tratamento
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaTratamento,
    atualizarTratamento,
    listarTratamento,
    buscarTratamento,
    excluirTratamento
} = require('../controller/tratamento/controller_tratamento.js')

// ---------------- tratamento -----------------

// endpoint para inserir tratamento
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaTratamento(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas tratamentos
router.get('/', async (req,res) => {
    let result = await listarTratamento()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um tratamento pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarTratamento(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um tratamento pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarTratamento(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um tratamento pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirTratamento(id)
    res.status(result.status_code).json(result)
})

module.exports = router
