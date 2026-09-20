/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela tratamento
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const tratamentoDAO = require('../../model/DAO/tratamento/tratamento.js')

// inserir nova tratamento
const inserirNovaTratamento = async (tratamento, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(tratamento, contentType)
        if(validar) return validar // 400 ou 415

        let result = await tratamentoDAO.insertTratamento(tratamento)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        tratamento.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, tratamento)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar tratamento
const atualizarTratamento = async (tratamento, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(tratamento, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarTratamento(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        tratamento.id = Number(id)
        let result = await tratamentoDAO.updateTratamento(tratamento)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, tratamento)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas tratamentos
const listarTratamento = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await tratamentoDAO.selectAllTratamento()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarTratamentoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarTratamentoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar tratamento pelo id
const buscarTratamento = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await tratamentoDAO.selectByIdTratamento(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir tratamento pelo id
const excluirTratamento = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarTratamento(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await tratamentoDAO.deleteTratamento(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (tratamento, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(tratamento == undefined || tratamento == null || typeof tratamento != 'object'){
        message.ERROR_BAD_REQUEST.field = '[TRATAMENTO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o medicamento
    if(typeof tratamento.nome_medicamento != 'string' || tratamento.nome_medicamento.trim() == '' || tratamento.nome_medicamento.length > 150){
        message.ERROR_BAD_REQUEST.field = '[NOME_MEDICAMENTO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a dosagem
    if(typeof tratamento.dosagem != 'string' || tratamento.dosagem.trim() == '' || tratamento.dosagem.length > 150){
        message.ERROR_BAD_REQUEST.field = '[DOSAGEM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a frequência opcional
    if(tratamento.frequencia != undefined && tratamento.frequencia != null &&
       (typeof tratamento.frequencia != 'string' || tratamento.frequencia.length > 100)){
        message.ERROR_BAD_REQUEST.field = '[FREQUENCIA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o lembrete opcional
    if(tratamento.lembrete_ativo != undefined && tratamento.lembrete_ativo != null &&
       ![0, 1, true, false].includes(tratamento.lembrete_ativo)){
        message.ERROR_BAD_REQUEST.field = '[LEMBRETE_ATIVO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente relacionado
    if(tratamento.id_paciente == undefined || tratamento.id_paciente == null || !Number.isInteger(Number(tratamento.id_paciente)) || Number(tratamento.id_paciente) <= 0){
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

    if(response != null) base.DEFAULT_MESSAGE.response.tratamento = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaTratamento,
    atualizarTratamento,
    listarTratamento,
    buscarTratamento,
    excluirTratamento
}