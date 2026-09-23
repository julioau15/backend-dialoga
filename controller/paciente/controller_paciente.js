/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela paciente
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const pacienteDAO = require('../../model/DAO/paciente/paciente.js')
const usuarioController = require('../usuario/controller_usuario.js')
const bycrypt = require('../../services/bcrypt.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')

// inserir nova paciente
const inserirNovaPaciente = async (paciente,foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(paciente, contentType)
        if(validar) return validar // 400 ou 415

        paciente.senha_hash = await bycrypt.criarHash(paciente.senha)
        paciente.nivel = 2 // define o nivel do usuario como paciente

        let resultUsuario = await usuarioController.inserirNovaUsuario(paciente, contentType)
        if(!resultUsuario.status) return resultUsuario

        paciente.id_usuario = resultUsuario.response.usuario.id

        let result = await pacienteDAO.insertPaciente(paciente)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        paciente.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, paciente)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar paciente
const atualizarPaciente = async (paciente, id, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(paciente, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarPaciente(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        paciente.id = Number(id)
        let result = await pacienteDAO.updatePaciente(paciente)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, paciente)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas pacientes
const listarPaciente = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await pacienteDAO.selectAllPaciente()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarPacienteMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarPacienteMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar paciente pelo id
const buscarPaciente = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await pacienteDAO.selectByIdPaciente(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir paciente pelo id
const excluirPaciente = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarPaciente(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await pacienteDAO.deletePaciente(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const buscarPacienteByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN // 401

        let idPaciente = decodedToken.decode.id
        let resultBuscarId = await buscarPaciente(idPaciente)

        return resultBuscarId // 200 ou 400 ou 404

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const editarPacienteByToken = async (paciente, token, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN // 401

        let idPaciente = decodedToken.decode.id
        let resultEditar = await atualizarPaciente(paciente, idPaciente, foto_avatar, contentType)

        return resultEditar // 200 ou 400 ou 404

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (paciente, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json' && !String(contentType).toLowerCase().includes('multipart/form-data')) return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(paciente == undefined || paciente == null || typeof paciente != 'object'){
        message.ERROR_BAD_REQUEST.field = '[PACIENTE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o nome completo
    if(typeof paciente.nome_completo != 'string' || paciente.nome_completo.trim() == '' || paciente.nome_completo.length > 150){
        message.ERROR_BAD_REQUEST.field = '[NOME_COMPLETO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o apelido opcional
    if(paciente.apelido != undefined && paciente.apelido != null &&
       (typeof paciente.apelido != 'string' || paciente.apelido.length > 80)){
        message.ERROR_BAD_REQUEST.field = '[APELIDO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o celular opcional
    if(paciente.celular != undefined && paciente.celular != null &&
       (typeof paciente.celular != 'string' || paciente.celular.length > 20)){
        message.ERROR_BAD_REQUEST.field = '[CELULAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o e-mail
    if(paciente.email == undefined || paciente.email == null ||
       paciente.email.length > 150){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a senha 
    if(paciente.senha == undefined || paciente.senha == null ||
       (typeof paciente.senha != 'string' || paciente.senha.length > 30)){
        message.ERROR_BAD_REQUEST.field = '[SENHA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o avatar opcional
    if(paciente.foto_avatar != undefined && paciente.foto_avatar != null &&
       (typeof paciente.foto_avatar != 'string' || paciente.foto_avatar.length > 255)){
        message.ERROR_BAD_REQUEST.field = '[FOTO_AVATAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de nascimento opcional
    if(paciente.data_nascimento != undefined && paciente.data_nascimento != null && String(paciente.data_nascimento).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_NASCIMENTO] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.paciente = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaPaciente,
    atualizarPaciente,
    listarPaciente,
    buscarPaciente,
    excluirPaciente,
    buscarPacienteByToken,
    editarPacienteByToken
}