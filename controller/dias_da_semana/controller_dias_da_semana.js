/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela diasDaSemana
 * Data: 26/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const diasDaSemanaDAO = require('../../model/DAO/dias_da_semana/dias_da_semana.js')

// inserir nova diasDaSemana
const inserirNovoDiasDaSemana = async (diasDaSemana, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(diasDaSemana, contentType)
        if(validar) return validar // 400 ou 415

        let result = await diasDaSemanaDAO.deleteDiasDaSemana(diasDaSemana)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        diasDaSemana.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, diasDaSemana)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar diasDaSemana
const atualizarDiasDaSemana = async (diasDaSemana, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(diasDaSemana, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarDiasDaSemana(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        diasDaSemana.id = Number(id)
        let result = await diasDaSemanaDAO.updateDiasDaSemana(diasDaSemana)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, diasDaSemana)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas diasDaSemanas
const listarDiasDaSemana = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await diasDaSemanaDAO.selectAllDiasDaSemana()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarDiasDaSemanaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarDiasDaSemanaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar diasDaSemana pelo id
const buscarDiasDaSemana = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await diasDaSemanaDAO.selectByIdDiasDaSemana(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir diasDaSemana pelo id
const excluirDiasDaSemana = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarDiasDaSemana(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await diasDaSemanaDAO.deleteDiasDaSemana(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (diasDaSemana, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(diasDaSemana == undefined || diasDaSemana == null || typeof diasDaSemana != 'object'){
        message.ERROR_BAD_REQUEST.field = '[dias_da_semana] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a dias_da_semana obrigatória
    if(typeof diasDaSemana.dias_da_semana != 'string' || diasDaSemana.dias_da_semana.trim() == '' || diasDaSemana.dias_da_semana.length > 17){
        message.ERROR_BAD_REQUEST.field = '[dias_da_semana] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.diasDaSemana = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovoDiasDaSemana,
    atualizarDiasDaSemana,
    listarDiasDaSemana,
    buscarDiasDaSemana,
    excluirDiasDaSemana
}