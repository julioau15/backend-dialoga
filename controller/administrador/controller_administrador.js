/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela administrador
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const administradorDAO = require('../../model/DAO/administrador/administrador.js')
const bcrypt = require('../../services/bcrypt.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')

// inserir nova administrador
const inserirNovaAdministrador = async (administrador,foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(administrador, contentType)
        if(validar) return validar // 400 ou 415

        administrador.senha_hash = await bcrypt.criarHash(administrador.senha_provisoria)

        let result = await administradorDAO.insertAdministrador(administrador)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        administrador.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, administrador)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar administrador
const atualizarAdministrador = async (administrador, id, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(administrador, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarAdministrador(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        administrador.senha_hash = await bcrypt.criarHash(administrador?.senha_provisoria)

        administrador.id = Number(id)
        let result = await administradorDAO.updateAdministrador(administrador)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, administrador)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas administradors
const listarAdministrador = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await administradorDAO.selectAllAdministrador()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarAdministradorMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarAdministradorMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar administrador pelo id
const buscarAdministrador = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await administradorDAO.selectByIdAdministrador(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir administrador pelo id
const excluirAdministrador = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarAdministrador(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await administradorDAO.deleteAdministrador(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const buscarAdministradorByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let idAdministrador = decodedToken.decode.id

        let resultBuscarId = await buscarAdministrador(idAdministrador)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        return resultBuscarId

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const editarAdministradorByToken = async (dados, token, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let idAdministrador = decodedToken.decode.id

        let resultBuscarId = await buscarAdministrador(idAdministrador)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        if(dados?.nova_senha != undefined && dados?.nova_senha != null){
            dados.senha_hash = await bcrypt.criarHash(dados.nova_senha)
        }

        let resultEditar = await atualizarAdministrador(dados, idAdministrador, foto_avatar, contentType)
        if(!resultEditar.status) return resultEditar // 400, 404, 415 ou 500

        return resultEditar

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (administrador, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Rejeita requisições com conteúdo incompatível
    if(String(contentType).toLowerCase() != 'application/json' && !String(contentType).toLowerCase().includes('multipart/form-data')) return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o administrador foi informado como objeto
    if(administrador == undefined || administrador == null || typeof administrador != 'object'){
        message.ERROR_BAD_REQUEST.field = '[ADMINISTRADOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida nome completo obrigatório
    if(typeof administrador.nome_completo != 'string' || administrador.nome_completo.trim() == '' || administrador.nome_completo.length > 150){
        message.ERROR_BAD_REQUEST.field = '[NOME_COMPLETO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Valida e-mail obrigatório
    if(typeof administrador.email != 'string' || administrador.email.trim() == '' || administrador.email.length > 150){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

     // Valida nova senha
    if(administrador?.nova_senha != undefined && administrador?.nova_senha != null &&
       (typeof administrador?.nova_senha != 'string' || administrador?.nova_senha.length > 30)){
        message.ERROR_BAD_REQUEST.field = '[NOVA_SENHA] INVÁLIDA'
        return message.ERROR_BAD_REQUEST
    }

    // Valida celular opcional
    if(administrador.celular != undefined && administrador.celular != null &&
       (typeof administrador.celular != 'string' || administrador.celular.length > 20)){
        message.ERROR_BAD_REQUEST.field = '[CELULAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Valida avatar opcional
    if(administrador.foto_avatar != undefined && administrador.foto_avatar != null &&
       typeof administrador.foto_avatar != 'string'){
        message.ERROR_BAD_REQUEST.field = '[FOTO_AVATAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Valida flag de senha provisória
    if(administrador.senha_provisoria != undefined && administrador.senha_provisoria != null &&
       ![0, 1, true, false].includes(administrador.senha_provisoria)){
        message.ERROR_BAD_REQUEST.field = '[SENHA_PROVISORIA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    return false
}

const validarId = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))
    
    // Valida identificador positivo
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

    if(response != null) base.DEFAULT_MESSAGE.response.administrador = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaAdministrador,
    atualizarAdministrador,
    listarAdministrador,
    buscarAdministrador,
    excluirAdministrador,
    buscarAdministradorByToken,
    editarAdministradorByToken
}