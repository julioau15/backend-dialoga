/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela profissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const profissionalDAO = require('../../model/DAO/profissional/profissional.js')
const usuarioController = require('../usuario/controller_usuario.js')
const profissionalEspecialidadeController = require('../profissional_especialidade/controller_profissional_especialidade.js')
const bcrypt = require('../../services/bcrypt.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')

// inserir nova profissional
const inserirNovaProfissional = async (profissional, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(profissional, contentType)
        if(validar) return validar // 400 ou 415

        profissional.senha_hash = await bcrypt.criarHash(profissional.senha)
        profissional.nivel = 1 // define o nivel do usuario como profissional

        let resultUsuario = await usuarioController.inserirNovaUsuario(profissional, contentType)
        if(!resultUsuario.status) return resultUsuario

        profissional.id_usuario = resultUsuario.response.usuario.id

        let result = await profissionalDAO.insertProfissional(profissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        let resultBuscarUsuario = await usuarioController.buscarUsuario(profissional.id_usuario)

        delete resultBuscarUsuario.response.usuario[0].senha
        delete resultBuscarUsuario.response.usuario[0].senha_hash

        delete profissional.senha
        delete profissional.senha_hash
        delete profissional.id_usuario

        profissional.id = result
        profissional.usuario = resultBuscarUsuario.response.usuario

        for (const especialidade of profissional.id_especialidade || []) {
            let profissionalEspecialidade = { id_especialidade: especialidade, id_profissional: profissional.id }
            let resultInsertEspecialidade = await profissionalEspecialidadeController.inserirNovaProfissionalEspecialidade(profissionalEspecialidade, 'application/json')
            if(!resultInsertEspecialidade.status) return message.SUCESS_CREATED_ITEM_WARNING
        }

        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, profissional)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar profissional
const atualizarProfissional = async (profissional, id, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(profissional, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarProfissional(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        profissional.id = Number(id)
        let result = await profissionalDAO.updateProfissional(profissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        delete profissional.senha
        delete profissional.senha_hash

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, profissional)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas profissionals
const listarProfissional = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await profissionalDAO.selectAllProfissional()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        for (let profissional of result) {
            let usuario = await usuarioController.buscarUsuario(profissional.id_usuario)

            delete usuario.response.usuario[0].senha
            delete usuario.response.usuario[0].senha_hash

            if(usuario.status) {
                profissional.usuario = usuario.response.usuario[0]
            }

            let especialidades = profissionalEspecialidadeController.buscarEspecialidadesIdProfissional(profissional.id)
            if(especialidades.status) {
                profissional.especialidade = especialidades.response.profissionalEspecialidade
            }
        }

        let listarProfissionalMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarProfissionalMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar profissional pelo id
const buscarProfissional = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await profissionalDAO.selectByIdProfissional(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        for (let profissional of result) {
            let usuario = await usuarioController.buscarUsuario(profissional.id_usuario)

            delete usuario.response.usuario[0].senha
            delete usuario.response.usuario[0].senha_hash

            if(usuario.status) {
                profissional.usuario = usuario.response.usuario[0]
            } 

            let especialidades = await profissionalEspecialidadeController.buscarEspecialidadesIdProfissional(profissional.id)
            if(especialidades.status) {
                profissional.especialidade = especialidades.response.profissionalEspecialidade
            }
        }

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir profissional pelo id
const excluirProfissional = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarProfissional(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await profissionalDAO.deleteProfissional(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const buscarProfissionalByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN // 401

        let idProfissional = decodedToken.decode.id
        let resultBuscarId = await buscarProfissional(idProfissional)

        return resultBuscarId // 200 ou 400 ou 404

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const editarProfissionalByToken = async (profissional, token, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN // 401

        let idProfissional = decodedToken.decode.id

        let validar = await validarDadosAtualizacao(profissional, contentType)
        if(validar) return validar // 400 ou 415

        profissional.id = Number(idProfissional)
        let result = await profissionalDAO.updateProfissional(profissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        let resultBuscarId = await buscarProfissional(idProfissional)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        return resultBuscarId // 200 ou 400 ou 404

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (profissional, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json' && !String(contentType).toLowerCase().includes('multipart/form-data')) return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(profissional == undefined || profissional == null || typeof profissional != 'object'){
        message.ERROR_BAD_REQUEST.field = '[PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o nome completo
    if(typeof profissional.nome_completo != 'string' || profissional.nome_completo.trim() == '' || profissional.nome_completo.length > 150){
        message.ERROR_BAD_REQUEST.field = '[NOME_COMPLETO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o CPF
    if(profissional?.cpf == null || profissional?.cpf == undefined || typeof profissional?.cpf != 'string' || profissional?.cpf.trim() == '' || profissional?.cpf.length > 11){
        message.ERROR_BAD_REQUEST.field = '[CPF] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o CRP
    if(profissional?.crp == undefined || typeof profissional?.crp != 'string' || profissional?.crp.trim() == '' || profissional?.crp.length > 20){
        message.ERROR_BAD_REQUEST.field = '[CRP] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a senha hash opcional
    if(profissional.senha != undefined && profissional.senha != null &&
       (typeof profissional.senha != 'string' || profissional.senha.length > 30)){
        message.ERROR_BAD_REQUEST.field = '[SENHA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o celular opcional
    if(profissional.celular != undefined && profissional.celular != null &&
       (typeof profissional.celular != 'string' || profissional.celular.length > 20)){
        message.ERROR_BAD_REQUEST.field = '[CELULAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a instituição opcional
    if(profissional.instituicao_clinica != undefined && profissional.instituicao_clinica != null &&
       (typeof profissional.instituicao_clinica != 'string' || profissional.instituicao_clinica.length > 150)){
        message.ERROR_BAD_REQUEST.field = '[INSTITUICAO_CLINICA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o avatar opcional
    if(profissional.foto_avatar != undefined && profissional.foto_avatar != null && typeof profissional.foto_avatar != 'string'){
        message.ERROR_BAD_REQUEST.field = '[FOTO_AVATAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const validarDadosAtualizacao = async (profissional, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida o formato da requisição
    if(
        String(contentType).toLowerCase() != 'application/json' &&
        !String(contentType).toLowerCase().includes('multipart/form-data')
    ){
        return message.ERROR_CONTENT_TYPE
    }

    // Nome, se enviado
    if(
        profissional.nome_completo != undefined &&
        (
            typeof profissional.nome_completo != 'string' ||
            profissional.nome_completo.trim() == '' ||
            profissional.nome_completo.length > 150
        )
    ){
        message.ERROR_BAD_REQUEST.field = '[NOME_COMPLETO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Celular, se enviado
    if(
        profissional.celular != undefined &&
        profissional.celular != null &&
        (
            typeof profissional.celular != 'string' ||
            profissional.celular.length > 20
        )
    ){
        message.ERROR_BAD_REQUEST.field = '[CELULAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
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

    if(response != null) base.DEFAULT_MESSAGE.response.profissional = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovaProfissional,
    atualizarProfissional,
    listarProfissional,
    buscarProfissional,
    excluirProfissional,
    buscarProfissionalByToken,
    editarProfissionalByToken
}