/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela tarefa
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const tarefaDAO = require('../../model/DAO/tarefa/tarefa.js')
const perguntasController = require('../pergunta/controller_pergunta.js')
const respostaController = require('../resposta/controller_resposta.js')
const tarefaDestinatarioController = require('../tarefa_destinatario/controller_tarefa_destinatario.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')
const {uploadFiles} = require('../upload/controller_upload_azure.js')

// inserir nova tarefa
const inserirNovaTarefa = async (tarefa, anexo_arquivo, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(tarefa, contentType)
        if(validar) return validar // 400 ou 415

        // Realiza o upload da imagem da tarefa
        if (anexo_arquivo) {
            let urlArquivo = await uploadFiles(anexo_arquivo)
            
            if(urlArquivo){
                tarefa.anexo_arquivo = urlArquivo
            }
        }

        let result = await tarefaDAO.insertTarefa(tarefa)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        tarefa.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, tarefa)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar tarefa
const atualizarTarefa = async (tarefa, id, anexo_arquivo, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(tarefa, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarTarefa(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        // Realiza o upload da imagem da tarefa
        if (anexo_arquivo) {
            let urlArquivo = await uploadFiles(anexo_arquivo)
            
            if(urlArquivo){
                tarefa.anexo_arquivo = urlArquivo
            }
        }

        tarefa.id = Number(id)
        let result = await tarefaDAO.updateTarefa(tarefa)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, tarefa)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas tarefas
const listarTarefa = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await tarefaDAO.selectAllTarefa()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarTarefaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarTarefaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar tarefa pelo id
const buscarTarefa = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await tarefaDAO.selectByIdTarefa(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        for(let tarefa of result){
            // busca as perguntas relacionadas a tarefa
            let resultBuscarPerguntas = await perguntasController.listarPerguntaByIdTarefa(tarefa.id)

            if(resultBuscarPerguntas.status){
                tarefa.perguntas = resultBuscarPerguntas.response.pergunta
            }
        }

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir tarefa pelo id
const excluirTarefa = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarTarefa(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        // busca tarefaDestinatario
        let tarefaDestinatario = await tarefaDestinatarioController.filtrarTarefasDestinatarios({"id_tarefa": id})

        if(tarefaDestinatario.status){
            // verifica se tem resposta
            for(let tarefa of tarefaDestinatario.response.tarefaDestinatario){
                let id_tarefa_destinatario = tarefa.id
                let respostas = await respostaController.listarRespostaByIdTarefaDestinatario(id_tarefa_destinatario)

                if (respostas.status) {
                    message.ERROR_BAD_REQUEST.field =
                        'Não é possível excluir esta tarefa, pois ela já contém respostas.'
                
                    return message.ERROR_BAD_REQUEST
                }
            }
        }

        let result = await tarefaDAO.deleteTarefa(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar tarefas por token
const listarTarefasByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let id = decodedToken.decode.id
        let nivel = decodedToken.decode.nivel

        let result = null

        if(nivel == 1) result = await tarefaDAO.selectTarefasByIdProfissional(id)

        else if(nivel == 2) result = await tarefaDAO.selectTarefasByIdPaciente(id)

        else return message.ERROR_INVALID_TOKEN

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        for(let tarefa of result){
            // busca as perguntas relacionadas a tarefa
            let resultBuscarPerguntas = await perguntasController.listarPerguntaByIdTarefa(tarefa.id)

            if(resultBuscarPerguntas.status){
                tarefa.perguntas = resultBuscarPerguntas.response.pergunta
            }
        }

        let listarTarefaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarTarefaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// inserir tarefa por token
const inserirTarefaByToken = async (tarefa, anexo_arquivo, token, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(tarefa, contentType)
        if(validar) return validar // 400 ou 415

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let id = decodedToken.decode.id
        let nivel = decodedToken.decode.nivel

        let result = null
        let ids = []

        // Realiza o upload da imagem da tarefa
        if (anexo_arquivo) {
            let urlArquivo = await uploadFiles(anexo_arquivo)
            
            if(urlArquivo){
                tarefa.anexo_arquivo = urlArquivo
            }
        }

        if(nivel == 2) result = await tarefaDAO.insertTarefaByIdPaciente(tarefa, id)

        else if(nivel == 1) {
            result = await tarefaDAO.insertTarefaByIdProfissional(tarefa, id)

            if(tarefa.prazos_por_paciente){

                for(let paciente of tarefa.prazos_por_paciente){
                    let tarefaDestinatario = {
                        prazo: paciente.prazo,
                        id_paciente: paciente.paciente_id,
                        id_tarefa: result
                    }
    
                    let resultInsert = await tarefaDestinatarioController.inserirNovaTarefaDestinatario(tarefaDestinatario, 'application/json')
                    if(resultInsert) ids.push(resultInsert)
    
                    if(ids.length > 0){
                        for(let id of ids){
                            // busca as perguntas relacionadas a tarefa
                            let resultBuscarPerguntas = await perguntasController.listarPerguntaByIdTarefa(id)
                
                            if(resultBuscarPerguntas.status){
                                tarefa.perguntas = resultBuscarPerguntas.response.pergunta
                            }
                        }
                    }
                }

            }
        } 

        else return message.ERROR_INVALID_TOKEN

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        tarefa.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, tarefa)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// enviar tarefa para o paciente por token
const enviarTarefaParaPacienteByToken = async (idTarefa, token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validarID = await validarId(idTarefa)
        if(validarID) return validarID // 400

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let id = decodedToken.decode.id
        let nivel = decodedToken.decode.nivel

        if(nivel != 1) return message.ERROR_INVALID_TOKEN

        let resultBuscarId = await buscarTarefa(idTarefa)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await tarefaDAO.enviarTarefaParaPaciente(idTarefa, id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (tarefa, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json' && !String(contentType).toLowerCase().includes('multipart/form-data')) return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(tarefa == undefined || tarefa == null || typeof tarefa != 'object'){
        message.ERROR_BAD_REQUEST.field = '[TAREFA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o título
    if(typeof tarefa.titulo != 'string' || tarefa.titulo.trim() == '' || tarefa.titulo.length > 200){
        message.ERROR_BAD_REQUEST.field = '[TITULO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o tipo
    if(typeof tarefa.tipo != 'string' || tarefa.tipo.trim() == '' || tarefa.tipo.length > 20){
        message.ERROR_BAD_REQUEST.field = '[TIPO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida as instruções opcionais
    if(tarefa.instrucoes != undefined && tarefa.instrucoes != null && typeof tarefa.instrucoes != 'string'){
        message.ERROR_BAD_REQUEST.field = '[INSTRUCOES] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o anexo opcional
    if(tarefa.anexo_arquivo != undefined && tarefa.anexo_arquivo != null &&
       (typeof tarefa.anexo_arquivo != 'string' || tarefa.anexo_arquivo.length > 255)){
        message.ERROR_BAD_REQUEST.field = '[ANEXO_ARQUIVO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o indicador de rascunho
    if(![0, 1, true, false].includes(tarefa.is_rascunho)){
        message.ERROR_BAD_REQUEST.field = '[IS_RASCUNHO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional quando informado
    if(tarefa.id_profissional_criador != undefined && tarefa.id_profissional_criador != null &&
       (!Number.isInteger(Number(tarefa.id_profissional_criador)) || Number(tarefa.id_profissional_criador) <= 0)){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL_CRIADOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o paciente quando informado
    if(tarefa.id_paciente_criador != undefined && tarefa.id_paciente_criador != null &&
       (!Number.isInteger(Number(tarefa.id_paciente_criador)) || Number(tarefa.id_paciente_criador) <= 0)){
        message.ERROR_BAD_REQUEST.field = '[ID_PACIENTE_CRIADOR] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.tarefa = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovaTarefa,
    atualizarTarefa,
    listarTarefa,
    buscarTarefa,
    excluirTarefa,
    listarTarefasByToken,
    inserirTarefaByToken,
    enviarTarefaParaPacienteByToken
}