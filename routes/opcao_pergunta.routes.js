/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de opcaoPergunta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaOpcaoPergunta,
    atualizarOpcaoPergunta,
    listarOpcaoPergunta,
    buscarOpcaoPergunta,
    excluirOpcaoPergunta
} = require('../controller/opcao_pergunta/controller_opcao_pergunta.js')

// ---------------- opcaoPergunta -----------------

// endpoint para inserir opcaoPergunta
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaOpcaoPergunta(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas opcaoPerguntas
router.get('/', async (req,res) => {
    let result = await listarOpcaoPergunta()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um opcaoPergunta pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarOpcaoPergunta(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um opcaoPergunta pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarOpcaoPergunta(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um opcaoPergunta pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirOpcaoPergunta(id)
    res.status(result.status_code).json(result)
})

module.exports = router
