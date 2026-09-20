/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de disponibilidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaDisponibilidade,
    atualizarDisponibilidade,
    listarDisponibilidade,
    buscarDisponibilidade,
    excluirDisponibilidade
} = require('../controller/disponibilidade/controller_disponibilidade.js')

// ---------------- disponibilidade -----------------

// endpoint para inserir disponibilidade
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaDisponibilidade(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas disponibilidades
router.get('/', async (req,res) => {
    let result = await listarDisponibilidade()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um disponibilidade pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarDisponibilidade(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um disponibilidade pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarDisponibilidade(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um disponibilidade pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirDisponibilidade(id)
    res.status(result.status_code).json(result)
})

module.exports = router
