/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de preferenciaNotificacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaPreferenciaNotificacao,
    atualizarPreferenciaNotificacao,
    listarPreferenciaNotificacao,
    buscarPreferenciaNotificacao,
    excluirPreferenciaNotificacao
} = require('../controller/preferencia_notificacao/controller_preferencia_notificacao.js')

// ---------------- preferenciaNotificacao -----------------

// endpoint para inserir preferenciaNotificacao
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaPreferenciaNotificacao(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas preferenciaNotificacaos
router.get('/', async (req,res) => {
    let result = await listarPreferenciaNotificacao()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um preferenciaNotificacao pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarPreferenciaNotificacao(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um preferenciaNotificacao pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarPreferenciaNotificacao(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um preferenciaNotificacao pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirPreferenciaNotificacao(id)
    res.status(result.status_code).json(result)
})

module.exports = router
