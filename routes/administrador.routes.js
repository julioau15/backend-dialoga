/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de administrador
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
    inserirNovaAdministrador,
    atualizarAdministrador,
    listarAdministrador,
    buscarAdministrador,
    excluirAdministrador,
    buscarAdministradorByToken, 
    editarAdministradorByToken
} = require('../controller/administrador/controller_administrador.js')

const formatarJson = async (dados, acao) => {
    const administradorInserir = {
        nome_completo      : String(dados.nome_completo),
        email              : String(dados.email),
        celular            : String(dados.celular),
        senha              : String(dados.senha_provisoria)
    }

    const administradorEditar = {
        nome_completo      : String(dados.nome_completo),
        celular            : String(dados.celular),
        senha              : String(dados.senha)
    }

    if(acao == 'inserir') {
        return administradorInserir
    }

    return administradorEditar
}

// ---------------- administrador -----------------

// endpoint para inserir administrador
router.post('/',upload.single('foto_avatar'), async (req,res) => {
    const dados = req.body
    const foto_avatar = req.file
    
    const administrador = await formatarJson(dados, 'inserir')

    let contentType = req.headers['content-type']

    let result = await inserirNovaAdministrador(administrador,foto_avatar,contentType)
    res.status(result.status_code).json(result)
})

// endpoint para retornar um adiministrador pelo token
router.get('/me', async (req,res) => {
    let token = req.headers['x-access-token']
    let result = await buscarAdministradorByToken(token)
    res.status(result.status_code).json(result)
})

// endpoint para retornar todos administradores
router.get('/', async (req,res) => {
    let result = await listarAdministrador()
    res.status(result.status_code).json(result)
})

// endpoint para buscar um administrador pelo id
router.get('/:id', async (req,res) => {
    let id = req.params.id
    let result = await buscarAdministrador(id)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um administrador pelo token
router.put('/me', upload.single('foto_avatar'), async (req,res) => {
    let token = req.headers['x-access-token']
    let dados = req.body
    let contentType = req.headers['content-type']

    const administrador = await formatarJson(dados, 'editar')
    let foto_avatar = req.file

    let result = await editarAdministradorByToken(administrador, token, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para atualizar um administrador pelo id
router.put('/:id', upload.single('foto_avatar'), async (req,res) => {
    let id          = req.params.id                 // Recebe o id por parametro
    let dados       = req.body                      // Recebe os dados do body da requisição
    let contentType = req.headers['content-type']   // Recebe o ContentType do header da requisição

    const administrador = await formatarJson(dados, 'editar')
    let foto_avatar = req.file

    let result      = await atualizarAdministrador(administrador, id, foto_avatar, contentType)
    res.status(result.status_code).json(result)
})

// endpoint para deletar um administrador pelo id
router.delete('/:id', async (req,res) => {
    let id = req.params.id
    let result = await excluirAdministrador(id)
    res.status(result.status_code).json(result)
})

module.exports = router
