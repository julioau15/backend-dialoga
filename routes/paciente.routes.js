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
const multer = require('multer') // upload de arquivos

// instancia para criar um objeto com as caracteristicas do multer
const upload = multer()

const {
    inserirNovaPaciente,
    atualizarPaciente,
    listarPaciente,
    buscarPaciente,
    excluirPaciente,
    buscarPacienteByToken,
    editarPacienteByToken
} = require('../controller/paciente/controller_paciente.js')

const formatarJson = async (dados) => {
    const paciente = {
        nome_completo     : dados.nome_completo,
        email             : dados.email,
        celular           : dados.celular,
        senha             : dados.senha
    }

    return paciente
}

// ---------------- paciente -----------------

// endpoint para inserir paciente
router.post('/',upload.single('foto_avatar'), async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let foto_avatar = req.file
    let contentType = req.headers['content-type']

    const paciente = await formatarJson(dados)

    let result = await inserirNovaPaciente(paciente,foto_avatar,contentType)
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
router.put('/:id', upload.single('foto_avatar'), async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    let foto_avatar = req.file

    const paciente = await formatarJson(dados)

    let result      = await atualizarPaciente(paciente, id, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um paciente pelo token
router.put('/me', upload.single('foto_avatar'), async (req,res) => {
    let token = req.headers['x-access-token']
    let dados = req.body
    let contentType = req.headers['content-type']
    let foto_avatar = req.file

    const paciente = await formatarJson(dados)

    let result = await editarPacienteByToken(paciente, token, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um paciente pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirPaciente(id)
    res.status(result.status_code).json(result)
})

module.exports = router
