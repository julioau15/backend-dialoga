/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de administrador
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaAdministrador,
    atualizarAdministrador,
    listarAdministrador,
    buscarAdministrador,
    excluirAdministrador
} = require('../controller/administrador/controller_administrador.js')

// ---------------- administrador -----------------

// endpoint para inserir administrador
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaAdministrador(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todos administradores
router.get('/', async (req,res) => {
    let result = await listarAdministrador()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um administrador pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarAdministrador(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um administrador pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarAdministrador(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um administrador pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirAdministrador(id)
    res.status(result.status_code).json(result)
})

module.exports = router
