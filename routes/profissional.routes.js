/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de profissional
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
    inserirNovaProfissional,
    atualizarProfissional,
    listarProfissional,
    buscarProfissional,
    excluirProfissional,
    buscarProfissionalByToken,
    editarProfissionalByToken,
    listarPacientesVinculados,
    inserirNovoVinculo,
    excluirVinculo
} = require('../controller/profissional/controller_profissional.js')

const formatarJson = async (dados, acao) => {
    const profissionalInserir = {
        nome_completo       : String(dados.nome_completo),
        celular             : String(dados.celular),
        email               : String(dados.email),
        senha               : String(dados.senha),
        cpf                 : String(dados.cpf),
        crp                 : String(dados.crp),
        instituicao_clinica : String(dados.instituicao_clinica),
        id_especialidade    : JSON.parse(dados.id_especialidade)
    }

     const profissionalEditar = {
        nome_completo       : String(dados.nome_completo),
        celular             : String(dados.celular),
        id_especialidade    : JSON.parse(dados.id_especialidade)
    }

    if(acao == 'inserir') return profissionalInserir

    return profissionalEditar
}

// ---------------- profissional -----------------

// endpoint para retornar paciente vinculados a um paciente
router.get('/me/pacientes', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await listarPacientesVinculados(token)
    res.status(result.status_code).json(result)
})

// endpoint para inserir um vinculo entre paciente e profissional
router.post('/me/pacientes/:id', async (req,res) => {
    let token = req.headers['x-access-token']
    let idPaciente = req.params.id
    let contentType = req.headers['content-type']

    let result = await inserirNovoVinculo(token, idPaciente)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um vinculo de  paciente pelo id
router.delete('/me/pacientes/:id', async (req,res) => {
    let id = req.params.id
    let token = req.headers['x-access-token']
    let result = await excluirVinculo(token, id)
    res.status(result.status_code).json(result)
})


// endpoint para inserir profissional
router.post('/',upload.single('foto_avatar'), async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let foto_avatar = req.file
    let contentType = req.headers['content-type']

    const profissional = await formatarJson(dados, 'inserir')

    let result = await inserirNovaProfissional(profissional,foto_avatar,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar um profissional pelo token
router.get('/me', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await buscarProfissionalByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todas profissionals
router.get('/', async (req,res) => {
    let result = await listarProfissional()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um profissional pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarProfissional(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um profissional pelo token
router.put('/me', upload.single('foto_avatar'), async (req,res) => {
    let token = req.headers['x-access-token']
    let dados = req.body
    let contentType = req.headers['content-type']
    let foto_avatar = req.file

    const profissional = await formatarJson(dados, 'editar')

    let result = await editarProfissionalByToken(profissional, token, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um profissional pelo id
router.put('/:id', upload.single('foto_avatar'), async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    let foto_avatar = req.file

    const profissional = await formatarJson(dados, 'editar')

    let result      = await atualizarProfissional(profissional, id, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um profissional pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirProfissional(id)
    res.status(result.status_code).json(result)
})

module.exports = router
