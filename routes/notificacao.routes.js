/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de notificacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaNotificacao,
    atualizarNotificacao,
    listarNotificacao,
    buscarNotificacao,
    excluirNotificacao
} = require('../controller/notificacao/controller_notificacao.js')

// ---------------- notificacao -----------------

// endpoint para inserir notificacao
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaNotificacao(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas notificacaos
router.get('/', async (req,res) => {
    let result = await listarNotificacao()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um notificacao pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarNotificacao(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um notificacao pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarNotificacao(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um notificacao pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirNotificacao(id)
    res.status(result.status_code).json(result)
})

module.exports = router
