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
const codigoController = require('../codigo_verificacao/controller_codigo_verificacao.js')

const FINALIDADE_RECUPERAR_SENHA = 'recuperar_senha'

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

// solicitar código de recuperação de senha
const solicitarRecuperarSenhaUsuario = async (dados, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const validar = await validarDadosEmail(dados, contentType)
        if (validar) return validar

        let dadosUsuario = await authDAO.selectAuthUsuario(dados)

        // se o email existe, gera e envia o código
        if (dadosUsuario && dadosUsuario.length > 0) {
            let resultCodigo = await codigoController.gerarCodigoVerificacao({
                email: dados.email,
                finalidade: FINALIDADE_RECUPERAR_SENHA
            }, contentType)

            if (!resultCodigo.status) return resultCodigo
        }

        // mesma resposta existindo ou não, para não revelar quais emails estão cadastrados
        return await montarMensagem(message, message.SUCESS_RESPONSE)

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// validar código sem consumir (o código será consumido na redefinição)
const validarCodigoUsuario = async (dados, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const validar = await validarDadosEmail(dados, contentType)
        if (validar) return validar

        return await codigoController.validarCodigoVerificacao({
            email: dados.email,
            finalidade: FINALIDADE_RECUPERAR_SENHA,
            codigo: dados.codigo
        }, contentType, false)

    } catch (error) {
        console.log(error)
        return message.ERROR_INTERNAL_SERVER_CONTROLLER
    }
}

// redefinir a senha (valida e consome o código)
const redefinirSenhaUsuario = async (usuario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const validarDados = await validarDadosRedefinirSenha(usuario, contentType)
        if (validarDados) return validarDados

        // valida e consome o código; se falhar, devolve o erro dele
        const resultCodigo = await codigoController.validarCodigoVerificacao({
            email: usuario.email,
            finalidade: FINALIDADE_RECUPERAR_SENHA,
            codigo: usuario.codigo
        }, contentType, true)

        if (!resultCodigo.status) return resultCodigo

        let dadosUsuario = await authDAO.selectAuthUsuario(usuario)

        if (!dadosUsuario || dadosUsuario.length < 1)
            return message.ERROR_UNAUTHORIZED

        const novaSenhaHash = await bcrypt.criarHash(usuario.senha)

        const atualizarSenha = await authDAO.updateSenhaUsuario(dadosUsuario[0].id, novaSenhaHash)

        if (!atualizarSenha)
            return message.ERROR_INTERNAL_SERVER_MODEL

        // não devolve dados do usuário (evita expor o senha_hash)
        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM)

    } catch (error) {
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

const validarDadosEmail = async (dados, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // 415

    if(dados == undefined || dados == null || typeof dados != 'object'){
        message.ERROR_BAD_REQUEST.field = '[DADOS] INVÁLIDOS'
        return message.ERROR_BAD_REQUEST // 400
    }

    if(typeof dados.email != 'string' || dados.email.trim() == '' || dados.email.length > 150){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const validarDadosRedefinirSenha = async (usuario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // 415

    if(usuario == undefined || usuario == null || typeof usuario != 'object'){
        message.ERROR_BAD_REQUEST.field = '[USUARIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    if(typeof usuario.email != 'string' || usuario.email.trim() == '' || usuario.email.length > 150){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    if(typeof usuario.codigo != 'string' || usuario.codigo.trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[CODIGO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    if(typeof usuario.senha != 'string' || usuario.senha.trim() == '' || usuario.senha.length > 30){
        message.ERROR_BAD_REQUEST.field = '[SENHA] INVÁLIDA'
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
    solicitarRecuperarSenhaUsuario,
    validarCodigoUsuario,
    redefinirSenhaUsuario
}