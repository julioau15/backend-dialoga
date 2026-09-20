/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela tarefaDestinatario
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const tarefaDestinatarioDAO = require('../../model/DAO/tarefa_destinatario/tarefa_destinatario.js')

// inserir nova tarefaDestinatario
const inserirNovaTarefaDestinatario = async (tarefaDestinatario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(tarefaDestinatario, contentType)
        if(validar) return validar // 400 ou 415

        let result = await tarefaDestinatarioDAO.insertTarefaDestinatario(tarefaDestinatario)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        tarefaDestinatario.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, tarefaDestinatario)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar tarefaDestinatario
const atualizarTarefaDestinatario = async (tarefaDestinatario, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(tarefaDestinatario, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarTarefaDestinatario(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        tarefaDestinatario.id = Number(id)
        let result = await tarefaDestinatarioDAO.updateTarefaDestinatario(tarefaDestinatario)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, tarefaDestinatario)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas tarefaDestinatarios
const listarTarefaDestinatario = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await tarefaDestinatarioDAO.selectAllTarefaDestinatario()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarTarefaDestinatarioMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarTarefaDestinatarioMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar tarefaDestinatario pelo id
const buscarTarefaDestinatario = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await tarefaDestinatarioDAO.selectByIdTarefaDestinatario(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir tarefaDestinatario pelo id
const excluirTarefaDestinatario = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarTarefaDestinatario(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await tarefaDestinatarioDAO.deleteTarefaDestinatario(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (tarefaDestinatario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(tarefaDestinatario == undefined || tarefaDestinatario == null || typeof tarefaDestinatario != 'object'){
        message.ERROR_BAD_REQUEST.field = '[TAREFA_DESTINATARIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o prazo opcional
    if(tarefaDestinatario.prazo != undefined && tarefaDestinatario.prazo != null && String(tarefaDestinatario.prazo).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[PRAZO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o status
    if(typeof tarefaDestinatario.status != 'string' || tarefaDestinatario.status.trim() == '' || tarefaDestinatario.status.length > 20){
        message.ERROR_BAD_REQUEST.field = '[STATUS] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a conclusão opcional
    if(tarefaDestinatario.data_conclusao != undefined && tarefaDestinatario.data_conclusao != null && String(tarefaDestinatario.data_conclusao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_CONCLUSAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a tarefa relacionada
    if(tarefaDestinatario.id_tarefa == undefined || tarefaDestinatario.id_tarefa == null || !Number.isInteger(Number(tarefaDestinatario.id_tarefa)) || Number(tarefaDestinatario.id_tarefa) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_TAREFA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente relacionado
    if(tarefaDestinatario.id_paciente == undefined || tarefaDestinatario.id_paciente == null || !Number.isInteger(Number(tarefaDestinatario.id_paciente)) || Number(tarefaDestinatario.id_paciente) <= 0){
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

    if(response != null) base.DEFAULT_MESSAGE.response.tarefaDestinatario = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaTarefaDestinatario,
    atualizarTarefaDestinatario,
    listarTarefaDestinatario,
    buscarTarefaDestinatario,
    excluirTarefaDestinatario
}