/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de anotacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaAnotacao,
    atualizarAnotacao,
    listarAnotacao,
    buscarAnotacao,
    excluirAnotacao
} = require('../controller/anotacao/controller_anotacao.js')

// ---------------- anotacao -----------------

// endpoint para inserir anotacao
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaAnotacao(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas anotacaos
router.get('/', async (req,res) => {
    let result = await listarAnotacao()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um anotacao pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarAnotacao(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um anotacao pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarAnotacao(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um anotacao pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirAnotacao(id)
    res.status(result.status_code).json(result)
})

module.exports = router
