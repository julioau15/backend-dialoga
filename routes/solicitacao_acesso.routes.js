/*************************************************************************************
 * Objetivo: Rotas das solicitações de acesso e categorias compartilhadas.
 * *********************************************************************************/

const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    listarSolicitacaoAcesso,
    aprovarSolicitacaoAcesso,
    reprovarSolicitacaoAcesso,
    atualizarCategoriasCompartilhadas,
    excluirSolicitacaoAcesso
} = require('../controller/solicitacao_acesso/controller_solicitacao_acesso.js')

router.get('/', async (req, res) => {
    let token = req.headers['x-access-token']
    let result = await listarSolicitacaoAcesso(token)
    res.status(result.status_code).json(result)
})

router.put('/:id/aprovar', bodyParserJSON, async (req, res) => {
    let token = req.headers['x-access-token']
    let id = req.params.id
    let categorias = req.body?.categorias ?? req.body?.categorias_compartilhadas ?? []
    let result = await aprovarSolicitacaoAcesso(token, id, categorias)
    res.status(result.status_code).json(result)
})

router.put('/:id/recusar', async (req, res) => {
    let token = req.headers['x-access-token']
    let id = req.params.id
    let result = await reprovarSolicitacaoAcesso(token, id)
    res.status(result.status_code).json(result)
})

router.put('/:id/categorias', bodyParserJSON, async (req, res) => {
    let token = req.headers['x-access-token']
    let id = req.params.id
    let categorias = req.body?.categorias ?? req.body?.categorias_compartilhadas
    let result = await atualizarCategoriasCompartilhadas(token, id, categorias)
    res.status(result.status_code).json(result)
})

// Mantém a rota anterior de atualização, com as mesmas validações de proprietário.
router.put('/:id', bodyParserJSON, async (req, res) => {
    let token = req.headers['x-access-token']
    let id = req.params.id
    let categorias = req.body?.categorias ?? req.body?.categorias_compartilhadas
    let result = await atualizarCategoriasCompartilhadas(token, id, categorias)
    res.status(result.status_code).json(result)
})

router.delete('/:id', async (req, res) => {
    let token = req.headers['x-access-token']
    let id = req.params.id
    let result = await excluirSolicitacaoAcesso(token, id)
    res.status(result.status_code).json(result)
})

module.exports = router
