/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela administrador
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const administradorDAO = require('../../model/DAO/adminstrador/adminstrador.js')

// inserir nova administrador
const inserirNovaAdministrador = async (administrador, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(administrador, contentType)
        if(validar) return validar // 400 ou 415

        let result = await administradorDAO.insertAdministrador(administrador)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        administrador.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, administrador)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar administrador
const atualizarAdministrador = async (administrador, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(administrador, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarAdministrador(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

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

const validarDados = async (administrador, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    if(administrador.nome == undefined || administrador.nome == null || administrador.nome == '' || administrador.nome.length > 100 || typeof(administrador.nome) != 'string'){
        message.ERROR_BAD_REQUEST.field = '[NOME] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.administrador = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaAdministrador,
    atualizarAdministrador,
    listarAdministrador,
    buscarAdministrador,
    excluirAdministrador
}