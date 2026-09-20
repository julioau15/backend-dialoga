/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela consulta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const consultaDAO = require('../../model/DAO/consulta/consulta.js')

// inserir nova consulta
const inserirNovaConsulta = async (consulta, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(consulta, contentType)
        if(validar) return validar // 400 ou 415

        let result = await consultaDAO.insertConsulta(consulta)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        consulta.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, consulta)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar consulta
const atualizarConsulta = async (consulta, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(consulta, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarConsulta(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        consulta.id = Number(id)
        let result = await consultaDAO.updateConsulta(consulta)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, consulta)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas consultas
const listarConsulta = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await consultaDAO.selectAllConsulta()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarConsultaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarConsultaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar consulta pelo id
const buscarConsulta = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await consultaDAO.selectByIdConsulta(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir consulta pelo id
const excluirConsulta = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarConsulta(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await consultaDAO.deleteConsulta(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (consulta, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    if(consulta.nome == undefined || consulta.nome == null || consulta.nome == '' || consulta.nome.length > 100 || typeof(consulta.nome) != 'string'){
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

    if(response != null) base.DEFAULT_MESSAGE.response.consulta = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaConsulta,
    atualizarConsulta,
    listarConsulta,
    buscarConsulta,
    excluirConsulta
}