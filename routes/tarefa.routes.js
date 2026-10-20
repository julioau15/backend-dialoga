/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de tarefa
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaTarefa,
    atualizarTarefa,
    listarTarefa,
    buscarTarefa,
    excluirTarefa,
    listarTarefasByToken,
    inserirTarefaByToken,
    enviarTarefaParaPacienteByToken
} = require('../controller/tarefa/controller_tarefa.js')

const {
    listarPerguntaByIdTarefa,
    inserirNovaPergunta
} = require('../controller/pergunta/controller_pergunta.js')

// ---------------- tarefa -----------------

// endpoint para inserir pergunta
router.post('/:id/perguntas',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaPergunta(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para inserir tarefa pelo token
router.post('/',bodyParserJSON, async (req,res) => {
    let token = req.headers['x-access-token']
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirTarefaByToken(dados, contentType, token)
    res.status(result.status_code).json(result)
})

// endpoint para listar perguntas pelo id da tarefa
router.get('/:id/perguntas', async (req,res) => {
    let idTarefa = req.params.id
    let result = await listarPerguntaByIdTarefa(idTarefa)
    res.status(result.status_code).json(result)
})

// endpoint para enviar tarefa para paciente pelo token
router.put('/:id/enviar', async (req,res) => {
    let idTarefa = req.params.id
    let token = req.headers['x-access-token']

    let result = await enviarTarefaParaPacienteByToken(idTarefa, token)
    res.status(result.status_code).json(result)
})

// endpoint para listar tarefas pelo token
router.get('/', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await listarTarefasByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para buscar um tarefa pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarTarefa(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um tarefa pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarTarefa(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um tarefa pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirTarefa(id)
    res.status(result.status_code).json(result)
})

module.exports = router
