/*********************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de auth
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *******************************************************************************************************/

const config_message = require('../module/configMessages.js')
const authDAO = require('../../model/DAO/auth/auth.js')
const usuarioDAO = require('../../model/DAO/usuario/usuario.js')
const jwt = require('../../middleware/middlewareJWT.js')
const bcrypt = require('../../services/bcrypt.js')

// autenticar usuário
const autenticarUsuario = async (usuario, contentType) => {

    let message = JSON.parse(JSON.stringify(config_message))

    try {

        // valida os dados do usuário e o formato da requisição
        const validarUsuario = await validarDados(usuario, contentType)
        if (validarUsuario) return validarUsuario

        // procura o usuário no banco de dados
        let dadosUsuario = await authDAO.selectAuthUsuario(usuario)

        // verifica se o usuário foi encontrado
        if (!dadosUsuario || dadosUsuario.length < 1)
            return message.ERROR_UNAUTHORIZED

        // valida a senha informada com a senha armazenada no banco
        const validarSenha = await bcrypt.validarSenha(
            usuario.senha,
            dadosUsuario[0].senha_hash
        )

        if (!validarSenha)
            return message.ERROR_UNAUTHORIZED

        // cria os dados que serão armazenados dentro do JWT
        const payload = {
            id: dadosUsuario[0].id,
            email: dadosUsuario[0].email,
            nivel: dadosUsuario[0].nivel
        }

        // gera o token JWT
        const token = await jwt.createJWT(payload)

        // adiciona o token apenas na resposta
        dadosUsuario[0].token = token

        return await montarMensagem(
            message,
            message.SUCESS_RESPONSE,
            dadosUsuario
        )

    } catch (error) {

        console.log(error)

        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const autenticarUsuarioGoogle = async (id_google, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        // Valida o formato da requisição
        if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

        // Garante que o id_google foi informado
        if(id_google == undefined || id_google == null || typeof id_google != 'string' || id_google.trim() == ''){
            message.ERROR_BAD_REQUEST.field = '[ID_GOOGLE] INVÁLIDO'
            return message.ERROR_BAD_REQUEST // 400
        }

        // procura o usuário no banco de dados
        let dadosUsuario = await authDAO.selectAuthUsuarioGoogle(id_google)
        
        // verifica se o usuário foi encontrado
        if (!dadosUsuario || dadosUsuario.length < 1)
            return message.ERROR_UNAUTHORIZED

        // cria os dados que serão armazenados dentro do JWT
        const payload = {
            id: dadosUsuario[0].id,
            email: dadosUsuario[0].email,
            nivel: dadosUsuario[0].nivel
        }

        // gera o token JWT
        const token = await jwt.createJWT(payload)

        // adiciona o token apenas na resposta
        dadosUsuario[0].token = token

        return await montarMensagem(
            message,
            message.SUCESS_RESPONSE,
            dadosUsuario
        )

    }catch (error) {
        console.log(error)

        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const redefinirSenhaUsuario = async (usuario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        // Valida os dados de entrada
        const validarDados = await validarDadosRedefinirSenha(usuario, contentType)
        if (validarDados) return validarDados

        // procura o usuário no banco de dados
        let dadosUsuario = await authDAO.selectAuthUsuario(usuario)
        
        // verifica se o usuário foi encontrado
        if (!dadosUsuario || dadosUsuario.length < 1)
            return message.ERROR_UNAUTHORIZED

        // redefine a senha do usuário
        const novaSenhaHash = await bcrypt.gerarSenhaHash(usuario.senha)

        usuario.senha_hash = novaSenhaHash

        const atualizarSenha = await usuarioDAO.updateUsuario(usuario)

        if (!atualizarSenha)
            return message.ERROR_INTERNAL_SERVER_CONTROLLER

        return await montarMensagem(
            message,
            message.SUCESS_RESPONSE,
            dadosUsuario
        )

    }catch (error) {
        console.log(error)

        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

const validarDados = async (usuario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o usuário foi informado
    if(usuario == undefined || usuario == null || typeof usuario != 'object'){
        message.ERROR_BAD_REQUEST.field = '[USUARIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o e-mail de acesso
    if(typeof(usuario.email) != 'string' || usuario.email.trim() == '' || usuario.email.length > 150){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a senha de acesso
    if(typeof(usuario.senha) != 'string' || usuario.senha.trim() == '' || usuario.senha.length > 30){
        message.ERROR_BAD_REQUEST.field = '[SENHA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const validarDadosRedefinirSenha = async (usuario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que a senha foi informada
    if(usuario.senha == undefined || usuario.senha == null || typeof usuario.senha != 'string' || usuario.senha.trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[SENHA] INVÁLIDA'
        return message.ERROR_BAD_REQUEST // 400
    }

    // garante que o email foi informado
    if(usuario.email == undefined || usuario.email == null || typeof usuario.email != 'string' || usuario.email.trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // garante que o codigo foi informado
    if(usuario.codigo == undefined || usuario.codigo == null || typeof usuario.codigo != 'string' || usuario.codigo.trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[CODIGO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const montarMensagem = async (base,status,response = null) => {
    base.DEFAULT_MESSAGE.status = status.status
    base.DEFAULT_MESSAGE.status_code = status.status_code
    base.DEFAULT_MESSAGE.message = status.message

    if(response != null) base.DEFAULT_MESSAGE.response.auth = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    autenticarUsuario,
    autenticarUsuarioGoogle,
    redefinirSenhaUsuario
}