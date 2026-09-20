/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela notificacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const notificacaoDAO = require('../../model/DAO/notificacao/notificacao.js')

// inserir nova notificacao
const inserirNovaNotificacao = async (notificacao, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(notificacao, contentType)
        if(validar) return validar // 400 ou 415

        let result = await notificacaoDAO.insertNotificacao(notificacao)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        notificacao.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, notificacao)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar notificacao
const atualizarNotificacao = async (notificacao, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(notificacao, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarNotificacao(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        notificacao.id = Number(id)
        let result = await notificacaoDAO.updateNotificacao(notificacao)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, notificacao)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas notificacaos
const listarNotificacao = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await notificacaoDAO.selectAllNotificacao()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarNotificacaoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarNotificacaoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar notificacao pelo id
const buscarNotificacao = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await notificacaoDAO.selectByIdNotificacao(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir notificacao pelo id
const excluirNotificacao = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarNotificacao(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await notificacaoDAO.deleteNotificacao(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (notificacao, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(notificacao == undefined || notificacao == null || typeof notificacao != 'object'){
        message.ERROR_BAD_REQUEST.field = '[NOTIFICACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a mensagem obrigatória
    if(typeof notificacao.titulo_mensagem != 'string' || notificacao.titulo_mensagem.trim() == '' || notificacao.titulo_mensagem.length > 255){
        message.ERROR_BAD_REQUEST.field = '[TITULO_MENSAGEM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o indicador de leitura
    if(![0, 1, true, false].includes(notificacao.lida)){
        message.ERROR_BAD_REQUEST.field = '[LIDA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de criação
    if(notificacao.data_criacao == undefined || notificacao.data_criacao == null || String(notificacao.data_criacao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_CRIACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a referência opcional
    if(notificacao.referencia_evento != undefined && notificacao.referencia_evento != null &&
       (typeof notificacao.referencia_evento != 'string' || notificacao.referencia_evento.length > 255)){
        message.ERROR_BAD_REQUEST.field = '[REFERENCIA_EVENTO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a categoria relacionada
    if(notificacao.id_categoria == undefined || notificacao.id_categoria == null || !Number.isInteger(Number(notificacao.id_categoria)) || Number(notificacao.id_categoria) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_CATEGORIA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Exige exatamente um destinatário
    if((notificacao.id_profissional == undefined || notificacao.id_profissional == null) ==
       (notificacao.id_paciente == undefined || notificacao.id_paciente == null)){
        message.ERROR_BAD_REQUEST.field = '[DESTINATARIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional quando informado
    if(notificacao.id_profissional != undefined && notificacao.id_profissional != null &&
       (!Number.isInteger(Number(notificacao.id_profissional)) || Number(notificacao.id_profissional) <= 0)){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente quando informado
    if(notificacao.id_paciente != undefined && notificacao.id_paciente != null &&
       (!Number.isInteger(Number(notificacao.id_paciente)) || Number(notificacao.id_paciente) <= 0)){
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

    if(response != null) base.DEFAULT_MESSAGE.response.notificacao = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaNotificacao,
    atualizarNotificacao,
    listarNotificacao,
    buscarNotificacao,
    excluirNotificacao
}