/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela vinculo
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const vinculoDAO = require('../../model/DAO/vinculo/vinculo.js')

// inserir nova vinculo
const inserirNovaVinculo = async (vinculo, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(vinculo, contentType)
        if(validar) return validar // 400 ou 415

        let result = await vinculoDAO.insertVinculo(vinculo)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        vinculo.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, vinculo)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar vinculo
const atualizarVinculo = async (vinculo, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(vinculo, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarVinculo(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        vinculo.id = Number(id)
        let result = await vinculoDAO.updateVinculo(vinculo)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, vinculo)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas vinculos
const listarVinculo = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await vinculoDAO.selectAllVinculo()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarVinculoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarVinculoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar vinculo pelo id
const buscarVinculo = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await vinculoDAO.selectByIdVinculo(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir vinculo pelo id
const excluirVinculo = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarVinculo(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await vinculoDAO.deleteVinculo(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (vinculo, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    if(vinculo.nome == undefined || vinculo.nome == null || vinculo.nome == '' || vinculo.nome.length > 100 || typeof(vinculo.nome) != 'string'){
        message.ERROR_BAD_REQUEST.field = '[NOME] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.vinculo = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaVinculo,
    atualizarVinculo,
    listarVinculo,
    buscarVinculo,
    excluirVinculo
}