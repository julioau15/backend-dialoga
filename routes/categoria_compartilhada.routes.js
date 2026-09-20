/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de categoriaCompartilhada
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaCategoriaCompartilhada,
    atualizarCategoriaCompartilhada,
    listarCategoriaCompartilhada,
    buscarCategoriaCompartilhada,
    excluirCategoriaCompartilhada
} = require('../controller/categoria_compartilhada/controller_categoria_compartilhada.js')

// ---------------- categoriaCompartilhada -----------------

// endpoint para inserir categoriaCompartilhada
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaCategoriaCompartilhada(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas categoriaCompartilhadas
router.get('/', async (req,res) => {
    let result = await listarCategoriaCompartilhada()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um categoriaCompartilhada pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarCategoriaCompartilhada(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um categoriaCompartilhada pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarCategoriaCompartilhada(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um categoriaCompartilhada pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirCategoriaCompartilhada(id)
    res.status(result.status_code).json(result)
})

module.exports = router
