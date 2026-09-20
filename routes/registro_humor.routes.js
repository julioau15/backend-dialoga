/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de registroHumor
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaRegistroHumor,
    atualizarRegistroHumor,
    listarRegistroHumor,
    buscarRegistroHumor,
    excluirRegistroHumor
} = require('../controller/registro_humor/controller_registro_humor.js')

// ---------------- registroHumor -----------------

// endpoint para inserir registroHumor
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaRegistroHumor(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas registroHumors
router.get('/', async (req,res) => {
    let result = await listarRegistroHumor()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um registroHumor pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarRegistroHumor(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um registroHumor pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarRegistroHumor(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um registroHumor pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirRegistroHumor(id)
    res.status(result.status_code).json(result)
})

module.exports = router
