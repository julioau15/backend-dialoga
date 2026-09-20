/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de tabela1
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const bodyParserJSON = bodyParser.json()

const { 
    inserirNovaTabela2,
    atualizarTabela2,
    listarTabela2,
    buscarTabela2,
    excluirTabela2
} = require('../controller/tabela1/controllerTabela2.js')

// ---------------- tabela1 -----------------

// endpoint para inserir tabela1
router.post('/',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaTabela2(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas tabela1s
router.get('/', async (req,res) => {
    let result = await listarTabela2()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um tabela1 pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarTabela2(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar uma tabela1 pelo id
router.put('/:id', bodyParserJSON, async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    
    let result      = await atualizarTabela2(dados, id, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar uma tabela1 pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirTabela2(id)
    res.status(result.status_code).json(result)
})

module.exports = router