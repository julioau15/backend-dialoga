/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela tarefa
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const tarefaDAO = require('../../model/DAO/tarefa/tarefa.js')

// inserir nova tarefa
const inserirNovaTarefa = async (tarefa, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(tarefa, contentType)
        if(validar) return validar // 400 ou 415

        let result = await tarefaDAO.insertTarefa(tarefa)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        tarefa.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, tarefa)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar tarefa
const atualizarTarefa = async (tarefa, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(tarefa, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarTarefa(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        tarefa.id = Number(id)
        let result = await tarefaDAO.updateTarefa(tarefa)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, tarefa)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas tarefas
const listarTarefa = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await tarefaDAO.selectAllTarefa()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarTarefaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarTarefaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar tarefa pelo id
const buscarTarefa = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await tarefaDAO.selectByIdTarefa(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir tarefa pelo id
const excluirTarefa = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarTarefa(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await tarefaDAO.deleteTarefa(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (tarefa, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(tarefa == undefined || tarefa == null || typeof tarefa != 'object'){
        message.ERROR_BAD_REQUEST.field = '[TAREFA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o título
    if(typeof tarefa.titulo != 'string' || tarefa.titulo.trim() == '' || tarefa.titulo.length > 200){
        message.ERROR_BAD_REQUEST.field = '[TITULO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o tipo
    if(typeof tarefa.tipo != 'string' || tarefa.tipo.trim() == '' || tarefa.tipo.length > 20){
        message.ERROR_BAD_REQUEST.field = '[TIPO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida as instruções opcionais
    if(tarefa.instrucoes != undefined && tarefa.instrucoes != null && typeof tarefa.instrucoes != 'string'){
        message.ERROR_BAD_REQUEST.field = '[INSTRUCOES] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o anexo opcional
    if(tarefa.anexo_arquivo != undefined && tarefa.anexo_arquivo != null &&
       (typeof tarefa.anexo_arquivo != 'string' || tarefa.anexo_arquivo.length > 255)){
        message.ERROR_BAD_REQUEST.field = '[ANEXO_ARQUIVO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o indicador de rascunho
    if(![0, 1, true, false].includes(tarefa.is_rascunho)){
        message.ERROR_BAD_REQUEST.field = '[IS_RASCUNHO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de criação
    if(tarefa.data_criacao == undefined || tarefa.data_criacao == null || String(tarefa.data_criacao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_CRIACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de envio opcional
    if(tarefa.data_envio != undefined && tarefa.data_envio != null && String(tarefa.data_envio).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_ENVIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Exige exatamente um criador
    if((tarefa.id_profissional_criador == undefined || tarefa.id_profissional_criador == null) ==
       (tarefa.id_paciente_criador == undefined || tarefa.id_paciente_criador == null)){
        message.ERROR_BAD_REQUEST.field = '[CRIADOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional quando informado
    if(tarefa.id_profissional_criador != undefined && tarefa.id_profissional_criador != null &&
       (!Number.isInteger(Number(tarefa.id_profissional_criador)) || Number(tarefa.id_profissional_criador) <= 0)){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL_CRIADOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente quando informado
    if(tarefa.id_paciente_criador != undefined && tarefa.id_paciente_criador != null &&
       (!Number.isInteger(Number(tarefa.id_paciente_criador)) || Number(tarefa.id_paciente_criador) <= 0)){
        message.ERROR_BAD_REQUEST.field = '[ID_PACIENTE_CRIADOR] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.tarefa = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaTarefa,
    atualizarTarefa,
    listarTarefa,
    buscarTarefa,
    excluirTarefa
}