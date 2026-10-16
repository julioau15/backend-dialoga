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
    editarPacienteByToken,
    primeiroAcessoPaciente,
    listarProfissionaisVinculados,
    inserirNovoVinculo,
    excluirVinculo
} = require('../controller/paciente/controller_paciente.js')

const {
    inserirNovaRegistroHumorByToken,
    listarRegistroHumorByToken
} = require('../controller/registro_humor/controller_registro_humor.js')

const {
    listarAnotacaoByIdPaciente,
    inserirNovaAnotacao
} = require('../controller/anotacao/controller_anotacao.js')

const {
    inserirNovaSolicitacaoAcesso
} = require('../controller/solicitacao_acesso/controller_solicitacao_acesso.js')

const formatarJson = async (dados, acao) => {
    const pacienteInserir = {
        nome_completo     : String(dados.nome_completo),
        email             : String(dados.email),
        celular           : String(dados.celular),
        senha             : String(dados.senha)
    }

    const pacienteEditar = {
        nome_completo     : String(dados.nome_completo),
        apelido             : String(dados.apelido),
        celular           : String(dados.celular),
    }

    if(acao == 'inserir') {
        return pacienteInserir
    }

    return pacienteEditar
}

// ---------------- paciente -----------------

// endpoint para listar os regitros de humor de um paciente pelo token
router.get('/me/registros-humor', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await listarRegistroHumorByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para retornar anotacoes de um paciente pelo token
router.get('/:id/anotacoes', async (req,res) => {
    let token = req.headers['x-access-token']
    let idPaciente = req.params.id
    let result = await listarAnotacaoByIdPaciente(token, idPaciente)
    res.status(result.status_code).json(result)
})

// endpoint para retornar profissionais vinculados a um paciente
router.get('/me/profissionais', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await listarProfissionaisVinculados(token)
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

// endpoint para inserir um vinculo entre paciente e profissional
router.post('/:id/anotacoes', bodyParserJSON, async (req,res) => {
    let token = req.headers['x-access-token']
    let idPaciente = req.params.id
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await inserirNovaAnotacao(dados, idPaciente, token, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para uma solicitação de acesso de um profissional a um paciente
router.post('/:id/solicitacoes-acesso', async (req,res) => {
    let token = req.headers['x-access-token']
    let idPaciente = req.params.id
    let result = await inserirNovaSolicitacaoAcesso(token, idPaciente)
    res.status(result.status_code).json(result)
})

// endpoint para inserir um vinculo entre paciente e profissional
router.post('/me/profissionais/:id', async (req,res) => {
    let token = req.headers['x-access-token']
    let idProfissional = req.params.id
    let contentType = req.headers['content-type']

    let result = await inserirNovoVinculo(token, idProfissional)
    res.status(result.status_code).json(result)
})

// endpoint para inserir um registro de humor de um paciente pelo token
router.post('/me/registros-humor', async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let token = req.headers['x-access-token']
    let contentType = req.headers['content-type']

    let result = await inserirNovaRegistroHumorByToken(dados, token, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para realizar o form de primeiro acesso do paciente
router.post('/primeiro-acesso', async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await primeiroAcessoPaciente(dados,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para inserir paciente
router.post('/',upload.single('foto_avatar'), async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let foto_avatar = req.file
    let contentType = req.headers['content-type']

    const paciente = await formatarJson(dados, 'inserir')

    let result = await inserirNovaPaciente(paciente,foto_avatar,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um paciente pelo id
router.delete('/me/profissionais/:id', async (req,res) => {
    let id = req.params.id
    let token = req.headers['x-access-token']
    let result = await excluirVinculo(token, id)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um paciente pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirPaciente(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um paciente pelo token
router.put('/me', upload.single('foto_avatar'), async (req,res) => {
    let token = req.headers['x-access-token']
    let dados = req.body
    let contentType = req.headers['content-type']
    let foto_avatar = req.file

    const paciente = await formatarJson(dados, 'editar')

    let result = await editarPacienteByToken(paciente, token, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um paciente pelo id
router.put('/:id', upload.single('foto_avatar'), async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição
    let foto_avatar = req.file

    const paciente = await formatarJson(dados, 'editar')

    let result      = await atualizarPaciente(paciente, id, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

module.exports = router
