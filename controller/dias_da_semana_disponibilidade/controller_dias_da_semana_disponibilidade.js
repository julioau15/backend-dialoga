/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela diasDaSemanaDisponibilidade
 * Data: 26/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const diasDaSemanaDisponibilidadeDAO = require('../../model/DAO/dias_da_semana_disponibilidade/dias_da_semana_disponibilidade.js')

// inserir nova diasDaSemanaDisponibilidade
const inserirNovoDiasDaSemanaDisponibilidade = async (diasDaSemanaDisponibilidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(diasDaSemanaDisponibilidade, contentType)
        if(validar) return validar // 400 ou 415

        let result = await diasDaSemanaDisponibilidadeDAO.insertDiasDaSemanaDisponibilidade(diasDaSemanaDisponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        diasDaSemanaDisponibilidade.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, diasDaSemanaDisponibilidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// listar todas diasDaSemanaDisponibilidades
const listarDiasDaSemanaDisponibilidade = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await diasDaSemanaDisponibilidadeDAO.selectAllDiasDaSemanaDisponibilidade()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarDiasDaSemanaDisponibilidadeMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarDiasDaSemanaDisponibilidadeMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar diasDaSemanaDisponibilidade pelo id
const buscarDiasDaSemanaDisponibilidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await diasDaSemanaDisponibilidadeDAO.selectByIdDiasDaSemanaDisponibilidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir diasDaSemanaDisponibilidade pelo id
const excluirDiasDaSemanaDisponibilidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarDiasDaSemanaDisponibilidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await diasDaSemanaDisponibilidadeDAO.deleteDiasDaSemanaDisponibilidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar os dias da semana pelo id da disponibilidade
const listarDiasDaSemanaByIdDisponibilidade = async (idDisponibilidade) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await diasDaSemanaDisponibilidadeDAO.selectDiasDaSemanaByIdDisponibilidade(idDisponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarDiasDaSemanaDisponibilidadeMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarDiasDaSemanaDisponibilidadeMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir diasDaSemanaDisponibilidade pelo id
const excluirDiasDaSemanaDisponibilidadeByIdDisponibilidade = async (idDisponibilidade) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await diasDaSemanaDisponibilidadeDAO.deleteDiasDaSemanaDisponibilidadeByIdDisponibilidade(idDisponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (diasDaSemanaDisponibilidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(diasDaSemanaDisponibilidade == undefined || diasDaSemanaDisponibilidade == null || typeof diasDaSemanaDisponibilidade != 'object'){
        message.ERROR_BAD_REQUEST.field = '[dias_da_semana_disponibilidade] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.diasDaSemanaDisponibilidade = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovoDiasDaSemanaDisponibilidade,
    listarDiasDaSemanaDisponibilidade,
    buscarDiasDaSemanaDisponibilidade,
    excluirDiasDaSemanaDisponibilidade,
    listarDiasDaSemanaByIdDisponibilidade,
    excluirDiasDaSemanaDisponibilidadeByIdDisponibilidade
}