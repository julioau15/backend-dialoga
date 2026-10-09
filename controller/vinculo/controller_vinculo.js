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

// listar pacientes pelo id do profissional
const listarPacientesByIdProfissional = async (id_profissional) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await vinculoDAO.selectByIdProfissional(id_profissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarVinculoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarVinculoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar profissionais pelo id do paciente
const listarProfissionaisByIdPaciente = async (idPaciente) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await vinculoDAO.selectByIdPaciente(idPaciente)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarVinculoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarVinculoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// cria um vinculo pacinte-profissional pelo profissional
const inserirNovoVinculoByProfissional = async (vinculo) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let result = await vinculoDAO.insertVinculoProfissional(vinculo)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        vinculo.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, vinculo)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// cria um vinculo pacinte-profissional pelo paciente
const inserirNovoVinculoByPaciente = async (vinculo) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let result = await vinculoDAO.insertVinculoPaciente(vinculo)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        vinculo.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, vinculo)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// remover paciente/ profissional da lista de acompanhamento
const excluirVinculoPacienteProfissional = async (idPaciente, idProfissonal) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await vinculoDAO.selectByIdPacienteProfissional(idPaciente, idProfissonal)
        if(!resultBuscarId) return message.ERROR_NOT_FOUND // 404

        let result = await vinculoDAO.deleteVinculoPacienteProfissional(idPaciente, idProfissonal)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// aceita um vinculo pelo id
const aceitarVinculo = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarVinculo(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await vinculoDAO.aceitarVinculo(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// recusa um vinculo pelo id
const recusarVinculo = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarVinculo(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await vinculoDAO.recusarVinculo(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (vinculo, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(vinculo == undefined || vinculo == null || typeof vinculo != 'object'){
        message.ERROR_BAD_REQUEST.field = '[VINCULO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o status
    if(typeof vinculo.status != 'string' || vinculo.status.trim() == '' || vinculo.status.length > 20){
        message.ERROR_BAD_REQUEST.field = '[STATUS] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a origem do cadastro
    if(typeof vinculo.origem_cadastro != 'string' || vinculo.origem_cadastro.trim() == '' || vinculo.origem_cadastro.length > 20){
        message.ERROR_BAD_REQUEST.field = '[ORIGEM_CADASTRO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a solicitação opcional
    if(vinculo.data_solicitacao != undefined && vinculo.data_solicitacao != null && String(vinculo.data_solicitacao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_SOLICITACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de aceite opcional
    if(vinculo.data_aceite != undefined && vinculo.data_aceite != null && String(vinculo.data_aceite).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_ACEITE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o início do acompanhamento opcional
    if(vinculo.data_inicio_acompanhamento != undefined && vinculo.data_inicio_acompanhamento != null && String(vinculo.data_inicio_acompanhamento).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_INICIO_ACOMPANHAMENTO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o fim do acompanhamento opcional
    if(vinculo.data_fim != undefined && vinculo.data_fim != null && String(vinculo.data_fim).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_FIM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional relacionado
    if(vinculo.id_profissional == undefined || vinculo.id_profissional == null || !Number.isInteger(Number(vinculo.id_profissional)) || Number(vinculo.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente relacionado
    if(vinculo.id_paciente == undefined || vinculo.id_paciente == null || !Number.isInteger(Number(vinculo.id_paciente)) || Number(vinculo.id_paciente) <= 0){
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

    if(response != null) base.DEFAULT_MESSAGE.response.vinculo = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaVinculo,
    atualizarVinculo,
    listarVinculo,
    buscarVinculo,
    excluirVinculo,
    listarPacientesByIdProfissional,
    listarProfissionaisByIdPaciente,
    inserirNovoVinculoByProfissional,
    inserirNovoVinculoByPaciente,
    excluirVinculoPacienteProfissional,
    aceitarVinculo,
    recusarVinculo
}