/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela profissionalEspecialidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const profissionalEspecialidadeDAO = require('../../model/DAO/profissional_especialidade/profissional_especialidade.js')

// inserir nova profissionalEspecialidade
const inserirNovaProfissionalEspecialidade = async (profissionalEspecialidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(profissionalEspecialidade, contentType)
        if(validar) return validar // 400 ou 415

        let result = await profissionalEspecialidadeDAO.insertProfissionalEspecialidade(profissionalEspecialidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        profissionalEspecialidade.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, profissionalEspecialidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar profissionalEspecialidade
const atualizarProfissionalEspecialidade = async (profissionalEspecialidade, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(profissionalEspecialidade, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarProfissionalEspecialidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        profissionalEspecialidade.id = Number(id)
        let result = await profissionalEspecialidadeDAO.updateProfissionalEspecialidade(profissionalEspecialidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, profissionalEspecialidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas profissionalEspecialidades
const listarProfissionalEspecialidade = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await profissionalEspecialidadeDAO.selectAllProfissionalEspecialidade()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarProfissionalEspecialidadeMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarProfissionalEspecialidadeMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar profissionalEspecialidade pelo id
const buscarProfissionalEspecialidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await profissionalEspecialidadeDAO.selectByIdProfissionalEspecialidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir profissionalEspecialidade pelo id
const excluirProfissionalEspecialidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarProfissionalEspecialidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await profissionalEspecialidadeDAO.deleteProfissionalEspecialidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const buscarEspecialidadesIdProfissional = async (idProfissional) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(idProfissional)
       if(validarID) return validarID

        let result = await profissionalEspecialidadeDAO.selectEspecialidadesByIdProfissional(idProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (profissionalEspecialidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(profissionalEspecialidade == undefined || profissionalEspecialidade == null || typeof profissionalEspecialidade != 'object'){
        message.ERROR_BAD_REQUEST.field = '[PROFISSIONAL_ESPECIALIDADE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional relacionado
    if(profissionalEspecialidade.id_profissional == undefined || profissionalEspecialidade.id_profissional == null || !Number.isInteger(Number(profissionalEspecialidade.id_profissional)) || Number(profissionalEspecialidade.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a especialidade relacionada
    if(profissionalEspecialidade.id_especialidade == undefined || profissionalEspecialidade.id_especialidade == null || !Number.isInteger(Number(profissionalEspecialidade.id_especialidade)) || Number(profissionalEspecialidade.id_especialidade) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_ESPECIALIDADE] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.profissionalEspecialidade = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaProfissionalEspecialidade,
    atualizarProfissionalEspecialidade,
    listarProfissionalEspecialidade,
    buscarProfissionalEspecialidade,
    excluirProfissionalEspecialidade,
    buscarEspecialidadesIdProfissional
}