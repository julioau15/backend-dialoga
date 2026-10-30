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
    buscarProfissionaisPorTermo,
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

const {
    listarDisponibilidadeByToken,
    inserirNovaDisponibilidadeByToken
} = require ('../controller/disponibilidade/controller_disponibilidade.js')

// converte o id_especialidade (que chega como texto no multipart) em array, sem quebrar se vier vazio/inválido
const parseEspecialidades = (valor) => {
    if (valor === undefined || valor === null || valor === '') return []
    if (Array.isArray(valor)) return valor.map(Number)
    try {
        const parsed = JSON.parse(valor)
        return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)]
    } catch {
        // aceita também formato "1,3"
        return String(valor).split(',').map(Number).filter(n => !isNaN(n))
    }
}

const formatarJson = async (dados = {}, acao) => {
    const profissionalInserir = {
        nome_completo       : String(dados.nome_completo),
        celular             : String(dados.celular),
        email               : String(dados.email),
        senha               : String(dados.senha),
        cpf                 : String(dados.cpf),
        crp                 : String(dados.crp),
        instituicao_clinica : dados.instituicao_clinica ? String(dados.instituicao_clinica) : null,
        id_especialidade    : parseEspecialidades(dados.id_especialidade)
    }

     const profissionalEditar = {
        nome_completo       : String(dados.nome_completo),
        celular             : String(dados.celular),
        id_especialidade    : parseEspecialidades(dados.id_especialidade)
    }

    if(acao == 'inserir') return profissionalInserir

    return profissionalEditar
}

// ---------------- profissional -----------------

// endpoint para retornar paciente vinculados a um paciente
router.get('/me/pacientes', async (req,res) => {
    let token = req.headers['x-access-token']
    const filtro = req.query
    
    let result = await listarPacientesVinculados(token, filtro)
    res.status(result.status_code).json(result)
})

// endpoint para retornar as disponibilidades de um profissional
router.get('/me/disponibilidades', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await listarDisponibilidadeByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para retornar um profissional pelo token
router.get('/me', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await buscarProfissionalByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para o paciente buscar profissionais aprovados por nome ou e-mail (?q=texto)
// (precisa vir antes de '/:id')
router.get('/busca', async (req,res) => {
    let result = await buscarProfissionaisPorTermo(req.query.q)
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

// endpoint para inserir uma nova disponibilidade para um profissional
router.post('/me/disponibilidades',bodyParserJSON, async (req,res) => {
    // recebe o conteudo dentro do body da requisição
    let dados = req.body
    let token = req.headers['x-access-token']
    let contentType = req.headers['content-type']

    let result = await inserirNovaDisponibilidadeByToken(dados, token, contentType)
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

// endpoint para deletar um vinculo de  paciente pelo id
router.delete('/me/pacientes/:id', async (req,res) => {
    let id = req.params.id
    let token = req.headers['x-access-token']
    let result = await excluirVinculo(token, id)
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
