/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de adminstrador
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaAdminstrador,
    atualizarAdminstrador,
    listarAdminstrador,
    buscarAdminstrador,
    excluirAdminstrador
} = require('../controller/adminstrador/controller_adminstrador.js')

// ---------------- adminstrador -----------------

// endpoint para inserir adminstrador
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaAdminstrador(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas adminstradors
router.get('/', async (req,res) => {
    let result = await listarAdminstrador()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um adminstrador pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarAdminstrador(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um adminstrador pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarAdminstrador(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um adminstrador pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirAdminstrador(id)
    res.status(result.status_code).json(result)
})

module.exports = router
