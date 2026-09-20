/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de administradorProfissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaAdministradorProfissional,
    atualizarAdministradorProfissional,
    listarAdministradorProfissional,
    buscarAdministradorProfissional,
    excluirAdministradorProfissional
} = require('../controller/administrador_profissional/controller_administrador_profissional.js')

// ---------------- administradorProfissional -----------------

// endpoint para inserir administradorProfissional
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaAdministradorProfissional(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas administradorProfissionals
router.get('/', async (req,res) => {
    let result = await listarAdministradorProfissional()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um administradorProfissional pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarAdministradorProfissional(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um administradorProfissional pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarAdministradorProfissional(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um administradorProfissional pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirAdministradorProfissional(id)
    res.status(result.status_code).json(result)
})

module.exports = router
