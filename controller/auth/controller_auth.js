/*********************************************************************************************************
 * Objetivo: Arquivo responsável pela validação, tratamento e manipulação de dados para o CRUD de auth
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *******************************************************************************************************/

const config_message = require('../module/configMessages.js')
const authDAO = require('../../model/DAO/auth/auth.js')
const jwt = require('../../middleware/middlewareJWT.js')
const bcrypt = require('../../services/bcrypt.js')
const controllerProfissional = require('../profissional/controller_profissional.js')
const controllerPaciente = require('../paciente/controller_paciente.js')
const controllerAdministrador = require('../administrador/controller_administrador.js')

// autenticar usuário
const autenticarUsuario = async (usuario, contentType) => {

    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const validarUsuario = await validarDados(usuario, contentType)
        if(validarUsuario) return validarUsuario
        
        // define qual função no DAO será chamada de acordo com o tipo de usuário
        let dadosUsuario = 
        usuario.tipo_usuario == administrador ?
            await authDAO.selectAuthAministrador(usuario) :
        usuario.tipo_usuario == profissional ?
            await authDAO.selectAuthProfissional(usuario) :
        usuario.tipo_usuario == paciente ?
            await authDAO.selectAuthPaciente(usuario) :
        null

        if (!dadosUsuario || dadosUsuario.length < 1)
            return message.ERROR_UNAUTHORIZED

        const validarSenha = await bcrypt.validarSenha(usuario.senha, dadosUsuario[0].senha)
        if(!validarSenha) return message.ERROR_UNAUTHORIZED

        let validarToken = await jwt.validateJWT(dadosUsuario[0].token)
        if(validarToken.status) return await montarMensagem(message,message.SUCESS_RESPONSE,dadosUsuario)

        // se o token estiver expirado ou for o primeiro login cria um novo e salva no banco
        if(validarToken['error']['expiredAt'] || dadosUsuario[0].token == null){
            let tokenUser = await jwt.createJWT(dadosUsuario[0].id) // gera token JWT

            dadosUsuario[0].token = tokenUser

            let dadosUpdateUsuario =
            usuario.tipo_usuario == administrador ?
                await controllerAdministrador.atualizarAdministrador(dadosUsuario[0],dadosUsuario[0].id,'application/json') :
            usuario.tipo_usuario == profissional ?
                await controllerProfissional.atualizarProfissional(dadosUsuario[0],dadosUsuario[0].id,'application/json') :
            usuario.tipo_usuario == paciente ?
                await controllerPaciente.atualizarPaciente(dadosUsuario[0],dadosUsuario[0].id,'application/json') :
            null 

            return await montarMensagem(message,message.SUCESS_RESPONSE,dadosUsuario)
        }
       
        return message.ERROR_UNAUTHORIZED

    } catch (error) {
        console.log(error)
    }

    return message.ERROR_INTERNAL_SERVER_CONTROLLER
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

    // Valida o tipo de usuário
    if(typeof(usuario.tipo_usuario) != 'string' || usuario.tipo_usuario.trim() == '' || usuario.tipo_usuario.length > 20){
        message.ERROR_BAD_REQUEST.field = '[TIPO_USUARIO] INVÁLIDO'
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
    autenticarUsuario
}