/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de solicitacaoAcesso
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    atualizarSolicitacaoAcesso,
    listarSolicitacaoAcesso,
    buscarSolicitacaoAcesso,
    excluirSolicitacaoAcesso,
    aprovarSolicitacaoAcesso,
    reprovarSolicitacaoAcesso
} = require('../controller/solicitacao_acesso/controller_solicitacao_acesso.js')

// ---------------- solicitacaoAcesso -----------------

// endpoint para retornar todas solicitacaoAcessos
router.get('/', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await listarSolicitacaoAcesso(token)
    res.status(result.status_code).json(result)
})

// endpoint para buscar um solicitacaoAcesso pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarSolicitacaoAcesso(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um solicitacaoAcesso pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarSolicitacaoAcesso(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um solicitacaoAcesso pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirSolicitacaoAcesso(id)
    res.status(result.status_code).json(result)
})

// endpoint para aprovar uma solicitacaoAcesso pelo id
router.put('/:id/aprovar', async (req,res) => {
    let id          = req.params.id
    let result      = await aprovarSolicitacaoAcesso(id)
    res.status(result.status_code).json(result)
})

// endpoint para reprovar uma solicitacaoAcesso pelo id
router.put('/:id/recusar', async (req,res) => {
    let id          = req.params.id
    let result      = await reprovarSolicitacaoAcesso(id)
    res.status(result.status_code).json(result)
})

module.exports = router
