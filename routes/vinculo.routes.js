/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de vinculo
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaVinculo,
    atualizarVinculo,
    listarVinculo,
    buscarVinculo,
    excluirVinculo,
    aceitarVinculo,
    recusarVinculo
} = require('../controller/vinculo/controller_vinculo.js')

// ---------------- vinculo -----------------

// endpoint para inserir vinculo
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaVinculo(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas vinculos
router.get('/', async (req,res) => {
    let result = await listarVinculo()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um vinculo pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarVinculo(id)
    res.status(result.status_code).json(result)
})

// endpoint para aceitar um vinculo
router.put('/:id/aceitar', async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    
    let result      = await aceitarVinculo(id)
    res.status(result.status_code).json(result)
})

// endpoint para recusar um vinculo
router.put('/:id/recusar', async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    
    let result      = await recusarVinculo(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um vinculo pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarVinculo(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um vinculo pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirVinculo(id)
    res.status(result.status_code).json(result)
})

module.exports = router
