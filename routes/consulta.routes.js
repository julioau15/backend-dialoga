/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de consulta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaConsulta,
    atualizarConsulta,
    listarConsulta,
    buscarConsulta,
    excluirConsulta
} = require('../controller/consulta/controller_consulta.js')

// ---------------- consulta -----------------

// endpoint para inserir consulta
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaConsulta(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas consultas
router.get('/', async (req,res) => {
    let result = await listarConsulta()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um consulta pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarConsulta(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um consulta pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarConsulta(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um consulta pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirConsulta(id)
    res.status(result.status_code).json(result)
})

module.exports = router
