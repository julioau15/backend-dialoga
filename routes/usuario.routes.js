/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de usuario
 * Data: 23/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const { 
    inserirNovaUsuario,
    atualizarUsuario,
    listarUsuario,
    buscarUsuario,
    excluirUsuario
} = require('../controller/usuario/controller_usuario.js')

// ---------------- usuario -----------------

// endpoint para inserir usuario
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaUsuario(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas usuarios
router.get('/', async (req,res) => {
    let result = await listarUsuario()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um usuario pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarUsuario(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar uma usuario pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarUsuario(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar uma usuario pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirUsuario(id)
    res.status(result.status_code).json(result)
})

module.exports = router