/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de resposta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaResposta,
    atualizarResposta,
    listarResposta,
    buscarResposta,
    excluirResposta
} = require('../controller/resposta/controller_resposta.js')

// ---------------- resposta -----------------

// endpoint para inserir resposta
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaResposta(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas respostas
router.get('/', async (req,res) => {
    let result = await listarResposta()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um resposta pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarResposta(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um resposta pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarResposta(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um resposta pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirResposta(id)
    res.status(result.status_code).json(result)
})

module.exports = router
