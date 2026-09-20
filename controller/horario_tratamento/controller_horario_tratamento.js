/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela tabela1
 * Data: 00/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const tabela1DAO = require('../../model/DAO/tabela1/tabela1.js')

// inserir nova tabela1
const inserirNovaTabela2 = async (tabela1, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(tabela1, contentType)
        if(validar) return validar // 400 ou 415

        let result = await tabela1DAO.insertTabela2(tabela1)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        tabela1.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, tabela1)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar tabela1
const atualizarTabela2 = async (tabela1, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(tabela1, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarTabela2(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        tabela1.id = Number(id)
        let result = await tabelaDAO.updateTabela2(tabela1)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, tabela1)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas tabela1s
const listarTabela2 = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await tabela1DAO.selectAllTabela2()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarTabela2Message = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarTabela2Message // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar tabela1 pelo id
const buscarTabela2 = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await tabela1DAO.selectByIdTabela2(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir tabela1 pelo id
const excluirTabela2 = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarTabela2(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await tabela1DAO.deleteTabela2(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (tabela1, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    if(tabela1.nome == undefined || tabela1.nome == null || tabela1.nome == '' || tabela1.nome.length > 100 || typeof(tabela1.nome) != 'string'){
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

    if(response != null) base.DEFAULT_MESSAGE.response.tabela1 = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaTabela2,
    atualizarTabela2,
    listarTabela2,
    buscarTabela2,
    excluirTabela2
}