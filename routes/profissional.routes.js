/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de profissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaProfissional,
    atualizarProfissional,
    listarProfissional,
    buscarProfissional,
    excluirProfissional,
    buscarProfissionalByToken
} = require('../controller/profissional/controller_profissional.js')

// ---------------- profissional -----------------

// endpoint para inserir profissional
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaProfissional(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar um profissional pelo token
router.get('/me', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await buscarProfissionalByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas profissionals
router.get('/', async (req,res) => {
    let result = await listarProfissional()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um profissional pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarProfissional(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um profissional pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarProfissional(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um profissional pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirProfissional(id)
    res.status(result.status_code).json(result)
})

module.exports = router
