/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de pergunta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaPergunta,
    atualizarPergunta,
    listarPergunta,
    buscarPergunta,
    excluirPergunta
} = require('../controller/pergunta/controller_pergunta.js')

// ---------------- pergunta -----------------

// endpoint para inserir pergunta
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaPergunta(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas perguntas
router.get('/', async (req,res) => {
    let result = await listarPergunta()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um pergunta pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarPergunta(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um pergunta pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarPergunta(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um pergunta pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirPergunta(id)
    res.status(result.status_code).json(result)
})

module.exports = router
