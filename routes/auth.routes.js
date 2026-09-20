/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de autenticação da API
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

// import do express
const express = require('express')

// Cria um objeto de rota para o arquivo
const router = express.Router()

const bodyParser = require('body-parser')

// Criando um objeto para manipular dados do body da API em formato JSON
const bodyParserJSON = bodyParser.json()

const {
    autenticarUsuario,
    autenticarUsuarioGoogle,
    deslogarUsuario,
    solicitarRecuperarSenhaUsuario,
    validarCodigoUsuario,
    redefinirSenhaUsuario
} = require('../controller/auth/controller_auth.js')

// endpoint para autenticar usuario pelo google
router.post('/login/google', bodyParserJSON, async (req,res) => {
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await autenticarUsuarioGoogle(dados, contentType)

    res.status(result.status_code).json(result)
})

// endpoint para autenticar usuario
router.post('/login', bodyParserJSON, async (req,res) => {
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await autenticarUsuario(dados, contentType)

    res.status(result.status_code).json(result)
})

// endpoint para deslogar usuario
router.post('/logout', bodyParserJSON, async (req,res) => {
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await deslogarUsuario(dados, contentType)

    res.status(result.status_code).json(result)
})

// endpoint para recuperar senha do usuario
router.post('/recuperar-senha/solicitar', bodyParserJSON, async (req,res) => {
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await solicitarRecuperarSenhaUsuario(dados, contentType)

    res.status(result.status_code).json(result)
})

// endpoint para validar código de recuperação de senha do usuario
router.post('/recuperar-senha/validar-codigo', bodyParserJSON, async (req,res) => {
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await validarCodigoUsuario(dados, contentType)

    res.status(result.status_code).json(result)
})

// endpoint para redefinir senha do usuario
router.post('/recuperar-senha/redefinir', bodyParserJSON, async (req,res) => {
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await redefinirSenhaUsuario(dados, contentType)

    res.status(result.status_code).json(result)
})

module.exports = router