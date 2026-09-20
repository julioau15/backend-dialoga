/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela solicitacaoAcesso
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const solicitacaoAcessoDAO = require('../../model/DAO/solicitacao_acesso/solicitacao_acesso.js')

// inserir nova solicitacaoAcesso
const inserirNovaSolicitacaoAcesso = async (solicitacaoAcesso, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(solicitacaoAcesso, contentType)
        if(validar) return validar // 400 ou 415

        let result = await solicitacaoAcessoDAO.insertSolicitacaoAcesso(solicitacaoAcesso)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        solicitacaoAcesso.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, solicitacaoAcesso)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar solicitacaoAcesso
const atualizarSolicitacaoAcesso = async (solicitacaoAcesso, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(solicitacaoAcesso, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarSolicitacaoAcesso(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        solicitacaoAcesso.id = Number(id)
        let result = await solicitacaoAcessoDAO.updateSolicitacaoAcesso(solicitacaoAcesso)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, solicitacaoAcesso)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas solicitacaoAcessos
const listarSolicitacaoAcesso = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await solicitacaoAcessoDAO.selectAllSolicitacaoAcesso()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarSolicitacaoAcessoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarSolicitacaoAcessoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar solicitacaoAcesso pelo id
const buscarSolicitacaoAcesso = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await solicitacaoAcessoDAO.selectByIdSolicitacaoAcesso(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir solicitacaoAcesso pelo id
const excluirSolicitacaoAcesso = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarSolicitacaoAcesso(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await solicitacaoAcessoDAO.deleteSolicitacaoAcesso(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (solicitacaoAcesso, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(solicitacaoAcesso == undefined || solicitacaoAcesso == null || typeof solicitacaoAcesso != 'object'){
        message.ERROR_BAD_REQUEST.field = '[SOLICITACAO_ACESSO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o status
    if(typeof solicitacaoAcesso.status != 'string' || solicitacaoAcesso.status.trim() == '' || solicitacaoAcesso.status.length > 20){
        message.ERROR_BAD_REQUEST.field = '[STATUS] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data da solicitação
    if(solicitacaoAcesso.data_solicitacao == undefined || solicitacaoAcesso.data_solicitacao == null || String(solicitacaoAcesso.data_solicitacao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_SOLICITACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de resposta opcional
    if(solicitacaoAcesso.data_resposta != undefined && solicitacaoAcesso.data_resposta != null && String(solicitacaoAcesso.data_resposta).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_RESPOSTA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional relacionado
    if(solicitacaoAcesso.id_profissional == undefined || solicitacaoAcesso.id_profissional == null || !Number.isInteger(Number(solicitacaoAcesso.id_profissional)) || Number(solicitacaoAcesso.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente relacionado
    if(solicitacaoAcesso.id_paciente == undefined || solicitacaoAcesso.id_paciente == null || !Number.isInteger(Number(solicitacaoAcesso.id_paciente)) || Number(solicitacaoAcesso.id_paciente) <= 0){
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

    if(response != null) base.DEFAULT_MESSAGE.response.solicitacaoAcesso = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaSolicitacaoAcesso,
    atualizarSolicitacaoAcesso,
    listarSolicitacaoAcesso,
    buscarSolicitacaoAcesso,
    excluirSolicitacaoAcesso
}