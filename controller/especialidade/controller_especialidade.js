/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela especialidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const especialidadeDAO = require('../../model/DAO/especialidade/especialidade.js')

// inserir nova especialidade
const inserirNovaEspecialidade = async (especialidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(especialidade, contentType)
        if(validar) return validar // 400 ou 415

        let result = await especialidadeDAO.insertEspecialidade(especialidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        especialidade.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, especialidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar especialidade
const atualizarEspecialidade = async (especialidade, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(especialidade, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarEspecialidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        especialidade.id = Number(id)
        let result = await especialidadeDAO.updateEspecialidade(especialidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, especialidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas especialidades
const listarEspecialidade = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await especialidadeDAO.selectAllEspecialidade()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarEspecialidadeMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarEspecialidadeMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar especialidade pelo id
const buscarEspecialidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await especialidadeDAO.selectByIdEspecialidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir especialidade pelo id
const excluirEspecialidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarEspecialidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await especialidadeDAO.deleteEspecialidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (especialidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(especialidade == undefined || especialidade == null || typeof especialidade != 'object'){
        message.ERROR_BAD_REQUEST.field = '[ESPECIALIDADE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a especialidade obrigatória
    if(typeof especialidade.especialidade != 'string' || especialidade.especialidade.trim() == '' || especialidade.especialidade.length > 100){
        message.ERROR_BAD_REQUEST.field = '[ESPECIALIDADE] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.especialidade = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaEspecialidade,
    atualizarEspecialidade,
    listarEspecialidade,
    buscarEspecialidade,
    excluirEspecialidade
}