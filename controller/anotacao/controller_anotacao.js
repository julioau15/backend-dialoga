/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela anotacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const anotacaoDAO = require('../../model/DAO/anotacao/anotacao.js')

// inserir nova anotacao
const inserirNovaAnotacao = async (anotacao, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(anotacao, contentType)
        if(validar) return validar // 400 ou 415

        let result = await anotacaoDAO.insertAnotacao(anotacao)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        anotacao.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, anotacao)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar anotacao
const atualizarAnotacao = async (anotacao, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(anotacao, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarAnotacao(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        anotacao.id = Number(id)
        let result = await anotacaoDAO.updateAnotacao(anotacao)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, anotacao)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas anotacaos
const listarAnotacao = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await anotacaoDAO.selectAllAnotacao()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarAnotacaoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarAnotacaoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar anotacao pelo id
const buscarAnotacao = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await anotacaoDAO.selectByIdAnotacao(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir anotacao pelo id
const excluirAnotacao = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarAnotacao(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await anotacaoDAO.deleteAnotacao(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (anotacao, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(anotacao == undefined || anotacao == null || typeof anotacao != 'object'){
        message.ERROR_BAD_REQUEST.field = '[ANOTACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o título obrigatório
    if(typeof anotacao.titulo != 'string' || anotacao.titulo.trim() == '' || anotacao.titulo.length > 200){
        message.ERROR_BAD_REQUEST.field = '[TITULO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o conteúdo obrigatório
    if(typeof anotacao.conteudo != 'string' || anotacao.conteudo.trim() == '' || anotacao.conteudo.length > 1000){
        message.ERROR_BAD_REQUEST.field = '[CONTEUDO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de criação
    if(anotacao.data_criacao == undefined || anotacao.data_criacao == null || String(anotacao.data_criacao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_CRIACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de edição opcional
    if(anotacao.data_edicao != undefined && anotacao.data_edicao != null && String(anotacao.data_edicao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_EDICAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional relacionado
    if(anotacao.id_profissional == undefined || anotacao.id_profissional == null || !Number.isInteger(Number(anotacao.id_profissional)) || Number(anotacao.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente relacionado
    if(anotacao.id_paciente == undefined || anotacao.id_paciente == null || !Number.isInteger(Number(anotacao.id_paciente)) || Number(anotacao.id_paciente) <= 0){
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

    if(response != null) base.DEFAULT_MESSAGE.response.anotacao = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaAnotacao,
    atualizarAnotacao,
    listarAnotacao,
    buscarAnotacao,
    excluirAnotacao
}