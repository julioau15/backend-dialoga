/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela disponibilidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const disponibilidadeDAO = require('../../model/DAO/disponibilidade/disponibilidade.js')

// inserir nova disponibilidade
const inserirNovaDisponibilidade = async (disponibilidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(disponibilidade, contentType)
        if(validar) return validar // 400 ou 415

        let result = await disponibilidadeDAO.insertDisponibilidade(disponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        disponibilidade.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, disponibilidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar disponibilidade
const atualizarDisponibilidade = async (disponibilidade, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(disponibilidade, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarDisponibilidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        disponibilidade.id = Number(id)
        let result = await disponibilidadeDAO.updateDisponibilidade(disponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, disponibilidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas disponibilidades
const listarDisponibilidade = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await disponibilidadeDAO.selectAllDisponibilidade()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarDisponibilidadeMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarDisponibilidadeMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar disponibilidade pelo id
const buscarDisponibilidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await disponibilidadeDAO.selectByIdDisponibilidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir disponibilidade pelo id
const excluirDisponibilidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarDisponibilidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await disponibilidadeDAO.deleteDisponibilidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (disponibilidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(disponibilidade == undefined || disponibilidade == null || typeof disponibilidade != 'object'){
        message.ERROR_BAD_REQUEST.field = '[DISPONIBILIDADE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida os dias da semana
    if(typeof disponibilidade.dias_da_semana != 'string' || disponibilidade.dias_da_semana.trim() == '' || disponibilidade.dias_da_semana.length > 50){
        message.ERROR_BAD_REQUEST.field = '[DIAS_DA_SEMANA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a hora inicial
    if(disponibilidade.hora_inicio == undefined || disponibilidade.hora_inicio == null || String(disponibilidade.hora_inicio).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[HORA_INICIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a hora final
    if(disponibilidade.hora_fim == undefined || disponibilidade.hora_fim == null || String(disponibilidade.hora_fim).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[HORA_FIM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o tipo de repetição
    if(typeof disponibilidade.tipo_repeticao != 'string' || disponibilidade.tipo_repeticao.trim() == '' || disponibilidade.tipo_repeticao.length > 20){
        message.ERROR_BAD_REQUEST.field = '[TIPO_REPETICAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data inicial opcional
    if(disponibilidade.data_inicial != undefined && disponibilidade.data_inicial != null && String(disponibilidade.data_inicial).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_INICIAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data final opcional
    if(disponibilidade.data_final != undefined && disponibilidade.data_final != null && String(disponibilidade.data_final).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_FINAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional relacionado
    if(disponibilidade.id_profissional == undefined || disponibilidade.id_profissional == null || !Number.isInteger(Number(disponibilidade.id_profissional)) || Number(disponibilidade.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.disponibilidade = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaDisponibilidade,
    atualizarDisponibilidade,
    listarDisponibilidade,
    buscarDisponibilidade,
    excluirDisponibilidade
}