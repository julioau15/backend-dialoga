/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de especialidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const {
    inserirNovaEspecialidade,
    atualizarEspecialidade,
    listarEspecialidade,
    buscarEspecialidade,
    excluirEspecialidade
} = require('../controller/especialidade/controller_especialidade.js')

// ---------------- especialidade -----------------

// endpoint para inserir especialidade
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaEspecialidade(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas especialidades
router.get('/', async (req,res) => {
    let result = await listarEspecialidade()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um especialidade pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarEspecialidade(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um especialidade pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarEspecialidade(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um especialidade pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirEspecialidade(id)
    res.status(result.status_code).json(result)
})

module.exports = router
