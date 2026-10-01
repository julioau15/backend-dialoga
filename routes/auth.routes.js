/*************************************************************************************
 * Objetivo: Arquivo responsável pelo gerenciamento de rotas de autenticação da API
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

/* 

-- Logica de autenticação do usuário com o Google --

- receber id_google do front-end
- verificar se o id_google existe no banco de dados
- caso exista, gerar token JWT e retornar para o front-end
- caso não exista, retornar mensagem de erro para o front-end ou redirecionar para a tela de cadastro do usuário

-- Logica de autenticação do usuário com email e senha --

- receber email e senha do front-end
- verificar se o email existe no banco de dados
- caso exista, validar a senha informada com a senha armazenada no banco
- caso a senha seja válida, gerar token JWT e retornar para o front-end
- caso a senha seja inválida, retornar mensagem de erro para o front-end

-- Logica de recuperação de senha do usuário --

- receber email do front-end
- verificar se o email existe no banco de dados
- caso exista, gerar um código de recuperação e enviar para o email do usuário
- caso não exista, retornar mensagem de erro para o front-end

-- Logica de validação do código de recuperação de senha do usuário --

- receber email e código de recuperação do front-end
- verificar se o email e o código de recuperação existem no banco de dados
- caso existam, retornar mensagem de sucesso para o front-end
- caso não existam, retornar mensagem de erro para o front-end

-- Logica de redefinição de senha do usuário --

- receber email e nova senha do front-end
- verificar se o email e o código de recuperação existem no banco de dados
- caso existam, atualizar a senha do usuário no banco de dados
- caso não existam, retornar mensagem de erro para o front-end

*/

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
    solicitarRecuperarSenhaUsuario,
    validarCodigoUsuario,
    redefinirSenhaUsuario
} = require('../controller/auth/controller_auth.js')

// endpoint para autenticar usuario pelo google
router.post('/login/google/:id_google', bodyParserJSON, async (req,res) => {
    let id_google = req.params.id_google
    let contentType = req.headers['content-type']

    let result = await autenticarUsuarioGoogle(id_google, contentType)

    res.status(result.status_code).json(result)
})

// endpoint para autenticar usuario
router.post('/login', bodyParserJSON, async (req,res) => {
    let dados = req.body
    let contentType = req.headers['content-type']

    let result = await autenticarUsuario(dados, contentType)

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