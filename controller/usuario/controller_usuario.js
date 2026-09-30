/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela usuario
 * Data: 23/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const usuarioDAO = require('../../model/DAO/usuario/usuario.js')

// inserir nova usuario
const inserirNovaUsuario = async (usuario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(usuario, contentType)
        if(validar) return validar // 400 ou 415

        let result = await usuarioDAO.insertUsuario(usuario)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        usuario.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, usuario)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar usuario
const atualizarUsuario = async (usuario, id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let resultBuscarId = await buscarUsuario(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        usuario.id = Number(id)
        let result = await usuarioDAO.updateUsuario(usuario)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, usuario)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas usuarios
const listarUsuario = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await usuarioDAO.selectAllUsuario()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarUsuarioMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarUsuarioMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar usuario pelo id
const buscarUsuario = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await usuarioDAO.selectByIdUsuario(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir usuario pelo id
const excluirUsuario = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarUsuario(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await usuarioDAO.deleteUsuario(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (usuario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

     // Valida se o formato de dados é JSON
    // Rejeita requisições com conteúdo incompatível
    if(String(contentType).toLowerCase() != 'application/json' && !String(contentType).toLowerCase().includes('multipart/form-data')) return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o usuario foi informado como objeto
    if(usuario == undefined || usuario == null || typeof usuario != 'object'){
        message.ERROR_BAD_REQUEST.field = '[USUARIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida e-mail obrigatório
    if(String(usuario.email).trim() == '' || String(usuario.email).length > 150){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

     // Valida nova senha
    if(usuario?.senha != undefined && usuario?.senha != null &&
       (typeof usuario?.senha != 'string' || usuario?.senha.length > 30)){
        message.ERROR_BAD_REQUEST.field = '[SENHA] INVÁLIDA'
        return message.ERROR_BAD_REQUEST
    }

     // Valida nivel de usuario
    if(usuario.nivel != undefined && usuario.nivel != null &&
       ![0, 1, 2, true, false].includes(usuario.nivel)){
        message.ERROR_BAD_REQUEST.field = '[NIVEL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    return false
}

const validarId = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))
    
    if(id == undefined || id == '' || id == null || id <= 0 || isNaN(id)){
        message.ERROR_BAD_REQUEST.field = '[ID] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const montarMensagem = async (base,status,response = null) => {
    base.DEFAULT_MESSAGE.status = status.status
    base.DEFAULT_MESSAGE.status_code = status.status_code
    base.DEFAULT_MESSAGE.message = status.message

    if(response != null) base.DEFAULT_MESSAGE.response.usuario = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaUsuario,
    atualizarUsuario,
    listarUsuario,
    buscarUsuario,
    excluirUsuario
}