/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de horarioTratamento
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaHorarioTratamento,
    atualizarHorarioTratamento,
    listarHorarioTratamento,
    buscarHorarioTratamento,
    excluirHorarioTratamento
} = require('../controller/horario_tratamento/controller_horario_tratamento.js')

// ---------------- horarioTratamento -----------------

// endpoint para inserir horarioTratamento
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaHorarioTratamento(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas horarioTratamentos
router.get('/', async (req,res) => {
    let result = await listarHorarioTratamento()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um horarioTratamento pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarHorarioTratamento(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um horarioTratamento pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarHorarioTratamento(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um horarioTratamento pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirHorarioTratamento(id)
    res.status(result.status_code).json(result)
})

module.exports = router
