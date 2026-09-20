/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela horarioTratamento
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const horarioTratamentoDAO = require('../../model/DAO/horario_tratamento/horario_tratamento.js')

// inserir nova horarioTratamento
const inserirNovaHorarioTratamento = async (horarioTratamento, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(horarioTratamento, contentType)
        if(validar) return validar // 400 ou 415

        let result = await horarioTratamentoDAO.insertHorarioTratamento(horarioTratamento)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        horarioTratamento.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, horarioTratamento)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar horarioTratamento
const atualizarHorarioTratamento = async (horarioTratamento, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(horarioTratamento, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarHorarioTratamento(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        horarioTratamento.id = Number(id)
        let result = await horarioTratamentoDAO.updateHorarioTratamento(horarioTratamento)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, horarioTratamento)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas horarioTratamentos
const listarHorarioTratamento = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await horarioTratamentoDAO.selectAllHorarioTratamento()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarHorarioTratamentoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarHorarioTratamentoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar horarioTratamento pelo id
const buscarHorarioTratamento = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await horarioTratamentoDAO.selectByIdHorarioTratamento(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir horarioTratamento pelo id
const excluirHorarioTratamento = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarHorarioTratamento(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await horarioTratamentoDAO.deleteHorarioTratamento(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (horarioTratamento, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(horarioTratamento == undefined || horarioTratamento == null || typeof horarioTratamento != 'object'){
        message.ERROR_BAD_REQUEST.field = '[HORARIO_TRATAMENTO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o horário
    if(horarioTratamento.horario == undefined || horarioTratamento.horario == null || String(horarioTratamento.horario).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[HORARIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o tratamento relacionado
    if(horarioTratamento.id_tratamento == undefined || horarioTratamento.id_tratamento == null || !Number.isInteger(Number(horarioTratamento.id_tratamento)) || Number(horarioTratamento.id_tratamento) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_TRATAMENTO] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.horarioTratamento = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaHorarioTratamento,
    atualizarHorarioTratamento,
    listarHorarioTratamento,
    buscarHorarioTratamento,
    excluirHorarioTratamento
}