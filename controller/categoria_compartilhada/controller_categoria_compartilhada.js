/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela categoriaCompartilhada
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const categoriaCompartilhadaDAO = require('../../model/DAO/categoria_compartilhada/categoria_compartilhada.js')

// inserir nova categoriaCompartilhada
const inserirNovaCategoriaCompartilhada = async (categoriaCompartilhada, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(categoriaCompartilhada, contentType)
        if(validar) return validar // 400 ou 415

        let result = await categoriaCompartilhadaDAO.insertCategoriaCompartilhada(categoriaCompartilhada)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        categoriaCompartilhada.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, categoriaCompartilhada)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar categoriaCompartilhada
const atualizarCategoriaCompartilhada = async (categoriaCompartilhada, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(categoriaCompartilhada, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarCategoriaCompartilhada(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        categoriaCompartilhada.id = Number(id)
        let result = await categoriaCompartilhadaDAO.updateCategoriaCompartilhada(categoriaCompartilhada)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, categoriaCompartilhada)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas categoriaCompartilhadas
const listarCategoriaCompartilhada = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await categoriaCompartilhadaDAO.selectAllCategoriaCompartilhada()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarCategoriaCompartilhadaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarCategoriaCompartilhadaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar categoriaCompartilhada pelo id
const buscarCategoriaCompartilhada = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await categoriaCompartilhadaDAO.selectByIdCategoriaCompartilhada(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir categoriaCompartilhada pelo id
const excluirCategoriaCompartilhada = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarCategoriaCompartilhada(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await categoriaCompartilhadaDAO.deleteCategoriaCompartilhada(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (categoriaCompartilhada, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(categoriaCompartilhada == undefined || categoriaCompartilhada == null || typeof categoriaCompartilhada != 'object'){
        message.ERROR_BAD_REQUEST.field = '[CATEGORIA_COMPARTILHADA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a categoria obrigatória
    if(typeof categoriaCompartilhada.categoria != 'string' || categoriaCompartilhada.categoria.trim() == '' || categoriaCompartilhada.categoria.length > 30){
        message.ERROR_BAD_REQUEST.field = '[CATEGORIA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a autorização
    if(![0, 1, true, false].includes(categoriaCompartilhada.autorizado)){
        message.ERROR_BAD_REQUEST.field = '[AUTORIZADO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a solicitação relacionada
    if(categoriaCompartilhada.id_solicitacao_acesso == undefined || categoriaCompartilhada.id_solicitacao_acesso == null || !Number.isInteger(Number(categoriaCompartilhada.id_solicitacao_acesso)) || Number(categoriaCompartilhada.id_solicitacao_acesso) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_SOLICITACAO_ACESSO] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.categoriaCompartilhada = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaCategoriaCompartilhada,
    atualizarCategoriaCompartilhada,
    listarCategoriaCompartilhada,
    buscarCategoriaCompartilhada,
    excluirCategoriaCompartilhada
}