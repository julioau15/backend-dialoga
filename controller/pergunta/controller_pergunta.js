/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela pergunta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const perguntaDAO = require('../../model/DAO/pergunta/pergunta.js')

// inserir nova pergunta
const inserirNovaPergunta = async (pergunta, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(pergunta, contentType)
        if(validar) return validar // 400 ou 415

        let result = await perguntaDAO.insertPergunta(pergunta)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        pergunta.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, pergunta)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar pergunta
const atualizarPergunta = async (pergunta, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(pergunta, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarPergunta(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        pergunta.id = Number(id)
        let result = await perguntaDAO.updatePergunta(pergunta)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, pergunta)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas perguntas
const listarPergunta = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await perguntaDAO.selectAllPergunta()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarPerguntaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarPerguntaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar pergunta pelo id
const buscarPergunta = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await perguntaDAO.selectByIdPergunta(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir pergunta pelo id
const excluirPergunta = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarPergunta(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await perguntaDAO.deletePergunta(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (pergunta, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(pergunta == undefined || pergunta == null || typeof pergunta != 'object'){
        message.ERROR_BAD_REQUEST.field = '[PERGUNTA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o tipo da pergunta
    if(typeof pergunta.tipo != 'string' || pergunta.tipo.trim() == '' || pergunta.tipo.length > 30){
        message.ERROR_BAD_REQUEST.field = '[TIPO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o texto da pergunta
    if(typeof pergunta.texto != 'string' || pergunta.texto.trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[TEXTO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a imagem opcional
    if(pergunta.imagem != undefined && pergunta.imagem != null &&
       (typeof pergunta.imagem != 'string' || pergunta.imagem.length > 255)){
        message.ERROR_BAD_REQUEST.field = '[IMAGEM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o indicador de obrigatoriedade
    if(![0, 1, true, false].includes(pergunta.obrigatoria)){
        message.ERROR_BAD_REQUEST.field = '[OBRIGATORIA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a ordem da pergunta
    if(pergunta.ordem == undefined || pergunta.ordem == null || !Number.isInteger(Number(pergunta.ordem)) || Number(pergunta.ordem) < 0){
        message.ERROR_BAD_REQUEST.field = '[ORDEM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a tarefa relacionada
    if(pergunta.id_tarefa == undefined || pergunta.id_tarefa == null || !Number.isInteger(Number(pergunta.id_tarefa)) || Number(pergunta.id_tarefa) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_TAREFA] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.pergunta = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaPergunta,
    atualizarPergunta,
    listarPergunta,
    buscarPergunta,
    excluirPergunta
}