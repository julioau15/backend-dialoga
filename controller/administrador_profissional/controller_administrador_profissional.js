/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela administradorProfissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const administradorProfissionalDAO = require('../../model/DAO/administrador_profissional/administrador_profissional.js')
const JWT = require('../../middleware/middlewareJWT.js')

// inserir nova administradorProfissional
const inserirNovaAdministradorProfissional = async (administradorProfissional, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(administradorProfissional, contentType)
        if(validar) return validar // 400 ou 415

        let result = await administradorProfissionalDAO.insertAdministradorProfissional(administradorProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        administradorProfissional.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, administradorProfissional)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar administradorProfissional
const atualizarAdministradorProfissional = async (administradorProfissional, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(administradorProfissional, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarAdministradorProfissional(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        administradorProfissional.id = Number(id)
        let result = await administradorProfissionalDAO.updateAdministradorProfissional(administradorProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, administradorProfissional)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas administradorProfissionals
const listarAdministradorProfissional = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await administradorProfissionalDAO.selectAllAdministradorProfissional()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarAdministradorProfissionalMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarAdministradorProfissionalMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar administradorProfissional pelo id
const buscarAdministradorProfissional = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await administradorProfissionalDAO.selectByIdAdministradorProfissional(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir administradorProfissional pelo id
const excluirAdministradorProfissional = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarAdministradorProfissional(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await administradorProfissionalDAO.deleteAdministradorProfissional(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// aprova um profissional pelo id
const aprovarAdministradorProfissional = async (id, token, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let idAdministrador = JWT.decodeJWT(token)
        if(!idAdministrador) return message.ERROR_UNAUTHORIZED

        let administradorProfissional = {
            status_aprovacao: 1,
            id_profissional: Number(id),
            id_administrador: Number(idAdministrador)
        }

        let result = await administradorProfissionalDAO.updateAdministradorProfissional(administradorProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, administradorProfissional)

    }catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// reprova um profissional pelo id
const reprovarAdministradorProfissional = async (id, token, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let idAdministrador = JWT.decodeJWT(token)
        if(!idAdministrador) return message.ERROR_UNAUTHORIZED

        let administradorProfissional = {
            status_aprovacao: 0,
            id_profissional: Number(id),
            id_administrador: Number(idAdministrador)
        }

        let result = await administradorProfissionalDAO.updateAdministradorProfissional(administradorProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, administradorProfissional)

    }catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (administradorProfissional, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(administradorProfissional == undefined || administradorProfissional == null || typeof administradorProfissional != 'object'){
        message.ERROR_BAD_REQUEST.field = '[ADMINISTRADOR_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o status da aprovação
    if(typeof administradorProfissional.status_aprovacao != 'string' || administradorProfissional.status_aprovacao.trim() == '' || administradorProfissional.status_aprovacao.length > 20){
        message.ERROR_BAD_REQUEST.field = '[STATUS_APROVACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de criação
    if(administradorProfissional.criado_em == undefined || administradorProfissional.criado_em == null || String(administradorProfissional.criado_em).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[CRIADO_EM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional relacionado
    if(administradorProfissional.id_profissional == undefined || administradorProfissional.id_profissional == null || !Number.isInteger(Number(administradorProfissional.id_profissional)) || Number(administradorProfissional.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o administrador opcional
    if(administradorProfissional.id_administrador != undefined && administradorProfissional.id_administrador != null &&
       (!Number.isInteger(Number(administradorProfissional.id_administrador)) || Number(administradorProfissional.id_administrador) <= 0)){
        message.ERROR_BAD_REQUEST.field = '[ID_ADMINISTRADOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
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

    if(response != null) base.DEFAULT_MESSAGE.response.administradorProfissional = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovaAdministradorProfissional,
    atualizarAdministradorProfissional,
    listarAdministradorProfissional,
    buscarAdministradorProfissional,
    excluirAdministradorProfissional,
    aprovarAdministradorProfissional,
    reprovarAdministradorProfissional
}