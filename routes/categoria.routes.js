/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de categoria
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaCategoria,
    atualizarCategoria,
    listarCategoria,
    buscarCategoria,
    excluirCategoria
} = require('../controller/categoria/controller_categoria.js')

// ---------------- categoria -----------------

// endpoint para inserir categoria
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaCategoria(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas categorias
router.get('/', async (req,res) => {
    let result = await listarCategoria()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um categoria pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarCategoria(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um categoria pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarCategoria(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um categoria pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirCategoria(id)
    res.status(result.status_code).json(result)
})

module.exports = router
