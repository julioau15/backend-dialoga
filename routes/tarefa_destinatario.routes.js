/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de tarefaDestinatario
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaTarefaDestinatario,
    atualizarTarefaDestinatario,
    listarTarefaDestinatario,
    buscarTarefaDestinatario,
    excluirTarefaDestinatario
} = require('../controller/tarefa_destinatario/controller_tarefa_destinatario.js')

// ---------------- tarefaDestinatario -----------------

// endpoint para inserir tarefaDestinatario
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaTarefaDestinatario(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas tarefaDestinatarios
router.get('/', async (req,res) => {
    let result = await listarTarefaDestinatario()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um tarefaDestinatario pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarTarefaDestinatario(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um tarefaDestinatario pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarTarefaDestinatario(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um tarefaDestinatario pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirTarefaDestinatario(id)
    res.status(result.status_code).json(result)
})

module.exports = router
