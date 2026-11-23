/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela administradorProfissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const administradorProfissionalDAO = require('../../model/DAO/administrador_profissional/administrador_profissional.js')
const profissionalController = require('../profissional/controller_profissional.js')
const { buscarAdministradorDoToken } = require('../module/autorizacao.js')

const MENSAGEM_CONFLITO_DECISAO = 'Esta solicitação já foi decidida ou está atribuída a outro administrador.'

// inserir nova administradorProfissional
const inserirNovaAdministradorProfissional = async (administradorProfissional, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(administradorProfissional, contentType)
        if(validar) return validar // 400 ou 415

        let result = await administradorProfissionalDAO.insertAdministradorProfissional(administradorProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        administradorProfissional.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, administradorProfissional)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar administradorProfissional
const atualizarAdministradorProfissional = async (administradorProfissional, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(administradorProfissional, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarAdministradorProfissional(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        administradorProfissional.id = Number(id)
        let result = await administradorProfissionalDAO.updateAdministradorProfissional(administradorProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, administradorProfissional)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas administradorProfissionals
// Antes de listar, distribui as pendentes sem responsável (divisão fixa entre os admins).
// Cada item informa o responsável e se a solicitação está atribuída a quem chamou.
const listarAdministradorProfissional = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let autorizacao = await buscarAdministradorDoToken(token)
        if(!autorizacao.ok) return autorizacao.erro // 401, 403 ou 500

        let distribuicao = await distribuirSolicitacoesPendentes()
        if(!distribuicao) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        let idAdministrador = Number(autorizacao.administrador.id)

        let result = await administradorProfissionalDAO.selectAllAdministradorProfissional()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        for(let administradorProfissional of result){
            administradorProfissional.responsavel = administradorProfissional.id_admin_responsavel
                ? { id: Number(administradorProfissional.id_admin_responsavel), nome_completo: administradorProfissional.nome_admin_responsavel }
                : null
            administradorProfissional.atribuida_a_mim = Number(administradorProfissional.id_admin_responsavel) === idAdministrador
            delete administradorProfissional.nome_admin_responsavel

            let resultBuscarProfissional = await profissionalController.buscarProfissional(administradorProfissional.id_profissional)
            if(resultBuscarProfissional.status){
                administradorProfissional.profissional = resultBuscarProfissional.response.profissional
                delete administradorProfissional.id_profissional
            }
        }

        let listarAdministradorProfissionalMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarAdministradorProfissionalMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar administradorProfissional pelo id
const buscarAdministradorProfissional = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await administradorProfissionalDAO.selectByIdAdministradorProfissional(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        for(let administradorProfissional of result){
            let resultBuscarProfissional = await profissionalController.buscarProfissional(administradorProfissional.id_profissional)
            if(resultBuscarProfissional.status){
                administradorProfissional.profissional = resultBuscarProfissional.response.profissional
                delete administradorProfissional.id_profissional
            }
        }

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir administradorProfissional pelo id
const excluirAdministradorProfissional = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarAdministradorProfissional(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await administradorProfissionalDAO.deleteAdministradorProfissional(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// aprova um profissional pelo id
const aprovarAdministradorProfissional = async (id, token) => {
    return await decidirSolicitacao(id, token, administradorProfissionalDAO.aprovarAdministradorProfissional)
}

// reprova um profissional pelo id
const reprovarAdministradorProfissional = async (id, token) => {
    return await decidirSolicitacao(id, token, administradorProfissionalDAO.reprovarAdministradorProfissional)
}

// aprova ou reprova: só o admin responsável decide, e uma decisão nunca é sobrescrita (409)
const decidirSolicitacao = async (id, token, gravarDecisao) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        const validarID = await validarId(id)
        if(validarID) return validarID // 400

        // o token traz o id de tbl_usuario; a FK aponta para tbl_administrador(id)
        let autorizacao = await buscarAdministradorDoToken(token)
        if(!autorizacao.ok) return autorizacao.erro // 401, 403 ou 500

        let administradorProfissional = {
            id_profissional: Number(id),
            id_administrador: Number(autorizacao.administrador.id)
        }

        let result = await gravarDecisao(administradorProfissional)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // nenhuma linha alterada: inexistente, já decidida ou atribuída a outro administrador
        if(result.afetadas === 0){
            message.ERROR_CONFLICT.message = MENSAGEM_CONFLITO_DECISAO
            return message.ERROR_CONFLICT // 409
        }

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, administradorProfissional)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// atribui cada pendente sem responsável ao admin com menos pendentes no momento
const distribuirSolicitacoesPendentes = async () => {
    let pendentes = await administradorProfissionalDAO.selectPendentesSemResponsavel()
    if(!pendentes) return false
    if(pendentes.length === 0) return true

    let cargas = await administradorProfissionalDAO.selectCargaPendentesPorAdministrador()
    if(!cargas) return false

    for(let pendente of pendentes){
        let idResponsavel = escolherResponsavel(cargas)
        if(idResponsavel == null) break

        let result = await administradorProfissionalDAO.atribuirResponsavelAdministradorProfissional(pendente.id, idResponsavel)
        if(!result) return false

        if(result.afetadas > 0) cargas.find((carga) => carga.id === idResponsavel).pendentes++
    }

    return true
}

// função pura: admin com menos pendentes; no empate, o de menor id (null sem admins)
const escolherResponsavel = (cargas) => {
    let escolhido = null

    for(let carga of cargas){
        if(escolhido == null ||
           carga.pendentes < escolhido.pendentes ||
           (carga.pendentes === escolhido.pendentes && carga.id < escolhido.id)){
            escolhido = carga
        }
    }

    return escolhido ? escolhido.id : null
}

// função pura: 'ok' | 'ja_decidida' | 'outro_responsavel' (mesma regra do UPDATE no DAO)
const podeDecidir = ({ status_aprovacao, id_admin_responsavel }, idAdministrador) => {
    if(status_aprovacao !== null && status_aprovacao !== undefined) return 'ja_decidida'
    if(id_admin_responsavel != null && Number(id_admin_responsavel) !== Number(idAdministrador)) return 'outro_responsavel'
    return 'ok'
}

const validarDados = async (administradorProfissional, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(administradorProfissional == undefined || administradorProfissional == null || typeof administradorProfissional != 'object'){
        message.ERROR_BAD_REQUEST.field = '[ADMINISTRADOR_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o status da aprovação
    if(typeof administradorProfissional.status_aprovacao != 'string' || administradorProfissional.status_aprovacao.trim() == '' || administradorProfissional.status_aprovacao.length > 20){
        message.ERROR_BAD_REQUEST.field = '[STATUS_APROVACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de criação
    if(administradorProfissional.criado_em == undefined || administradorProfissional.criado_em == null || String(administradorProfissional.criado_em).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[CRIADO_EM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o profissional relacionado
    if(administradorProfissional.id_profissional == undefined || administradorProfissional.id_profissional == null || !Number.isInteger(Number(administradorProfissional.id_profissional)) || Number(administradorProfissional.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o administrador opcional
    if(administradorProfissional.id_administrador != undefined && administradorProfissional.id_administrador != null &&
       (!Number.isInteger(Number(administradorProfissional.id_administrador)) || Number(administradorProfissional.id_administrador) <= 0)){
        message.ERROR_BAD_REQUEST.field = '[ID_ADMINISTRADOR] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.administradorProfissional = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovaAdministradorProfissional,
    atualizarAdministradorProfissional,
    listarAdministradorProfissional,
    buscarAdministradorProfissional,
    excluirAdministradorProfissional,
    aprovarAdministradorProfissional,
    reprovarAdministradorProfissional,
    podeDecidir,
    escolherResponsavel
}