/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de paciente
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaPaciente,
    atualizarPaciente,
    listarPaciente,
    buscarPaciente,
    excluirPaciente,
    buscarPacienteByToken
} = require('../controller/paciente/controller_paciente.js')

// ---------------- paciente -----------------

// endpoint para inserir paciente
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaPaciente(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar um paciente pelo token
router.get('/me', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await buscarPacienteByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas pacientes
router.get('/', async (req,res) => {
    let result = await listarPaciente()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um paciente pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarPaciente(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um paciente pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarPaciente(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um paciente pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirPaciente(id)
    res.status(result.status_code).json(result)
})

module.exports = router
