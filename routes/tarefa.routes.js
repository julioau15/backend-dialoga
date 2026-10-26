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
const multer = require('multer') // upload de arquivos

// instancia para criar um objeto com as caracteristicas do multer
const upload = multer()

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

const formatarJson = async (dados) => {
    const tarefa = {
       titulo                   : String(dados?.titulo)                  || null,
       tipo                     : String(dados?.tipo)                    || null,
       instrucoes               : String(dados?.instrucoes)              || null,
       is_rascunho              : dados?.is_rascunho == 0 ? 0 : dados.is_rascunho || null,
       id_profissional_criador  : Number(dados?.id_profissional_criador) || null,
       id_paciente_criador      : Number(dados?.id_paciente_criador)     || null,
       paciente_ids             : JSON.parse(dados?.paciente_ids)        || null,
       prazos_por_paciente      : JSON.parse(dados?.prazos_por_paciente) || null
    }

    return tarefa
}

// ---------------- tarefa -----------------

// endpoint para inserir pergunta
router.post('/:id/perguntas',bodyParserJSON, async (req,res) => {
    let id = req.params.id
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaPergunta(dados,id,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para inserir tarefa pelo token
router.post('/',upload.single('anexo_arquivo'), bodyParserJSON, async (req,res) => {
    let token = req.headers['x-access-token']
    let dados = await formatarJson(req.body)
    let contentType = req.headers['content-type']
    const anexo_arquivo = req.file

    let result = await inserirTarefaByToken(dados, anexo_arquivo, token, contentType)
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
router.put('/:id', upload.single('anexo_arquivo'), bodyParserJSON, async (req,res) => {
    let id          = req.params.id          
    let dados       = await formatarJson(req.body)   
    let contentType = req.headers['content-type'] 
    const anexo_arquivo = req.file
    
    let result      = await atualizarTarefa(dados, id, anexo_arquivo, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um tarefa pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirTarefa(id)
    res.status(result.status_code).json(result)
})

module.exports = router
