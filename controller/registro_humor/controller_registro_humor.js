/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela registroHumor
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const registroHumorDAO = require('../../model/DAO/registro_humor/registro_humor.js')

// inserir nova registroHumor
const inserirNovaRegistroHumor = async (registroHumor, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(registroHumor, contentType)
        if(validar) return validar // 400 ou 415

        let result = await registroHumorDAO.insertRegistroHumor(registroHumor)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        registroHumor.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, registroHumor)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar registroHumor
const atualizarRegistroHumor = async (registroHumor, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(registroHumor, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarRegistroHumor(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        registroHumor.id = Number(id)
        let result = await registroHumorDAO.updateRegistroHumor(registroHumor)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, registroHumor)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas registroHumors
const listarRegistroHumor = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await registroHumorDAO.selectAllRegistroHumor()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarRegistroHumorMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarRegistroHumorMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar registroHumor pelo id
const buscarRegistroHumor = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await registroHumorDAO.selectByIdRegistroHumor(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir registroHumor pelo id
const excluirRegistroHumor = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarRegistroHumor(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await registroHumorDAO.deleteRegistroHumor(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (registroHumor, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(registroHumor == undefined || registroHumor == null || typeof registroHumor != 'object'){
        message.ERROR_BAD_REQUEST.field = '[REGISTRO_HUMOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data do registro
    if(registroHumor.data == undefined || registroHumor.data == null || String(registroHumor.data).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o sentimento
    if(typeof registroHumor.sentimento != 'string' || registroHumor.sentimento.trim() == '' || registroHumor.sentimento.length > 30){
        message.ERROR_BAD_REQUEST.field = '[SENTIMENTO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a energia
    if(typeof registroHumor.energia != 'string' || registroHumor.energia.trim() == '' || registroHumor.energia.length > 20){
        message.ERROR_BAD_REQUEST.field = '[ENERGIA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o humor
    if(typeof registroHumor.humor != 'string' || registroHumor.humor.trim() == '' || registroHumor.humor.length > 20){
        message.ERROR_BAD_REQUEST.field = '[HUMOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o padrão de pensamentos
    if(typeof registroHumor.padrao_pensamentos != 'string' || registroHumor.padrao_pensamentos.trim() == '' || registroHumor.padrao_pensamentos.length > 500){
        message.ERROR_BAD_REQUEST.field = '[PADRAO_PENSAMENTOS] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida as horas de sono
    if(registroHumor.horas_sono == undefined || registroHumor.horas_sono == null || isNaN(Number(registroHumor.horas_sono)) || Number(registroHumor.horas_sono) < 0){
        message.ERROR_BAD_REQUEST.field = '[HORAS_SONO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o relato opcional
    if(registroHumor.relato != undefined && registroHumor.relato != null && typeof registroHumor.relato != 'string'){
        message.ERROR_BAD_REQUEST.field = '[RELATO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de criação
    if(registroHumor.data_criacao == undefined || registroHumor.data_criacao == null || String(registroHumor.data_criacao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_CRIACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente relacionado
    if(registroHumor.id_paciente == undefined || registroHumor.id_paciente == null || !Number.isInteger(Number(registroHumor.id_paciente)) || Number(registroHumor.id_paciente) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PACIENTE] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.registroHumor = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaRegistroHumor,
    atualizarRegistroHumor,
    listarRegistroHumor,
    buscarRegistroHumor,
    excluirRegistroHumor
}