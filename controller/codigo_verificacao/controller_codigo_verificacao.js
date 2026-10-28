/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela codigo_verificacao
 * Data: 26/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const crypto = require('crypto')
const config_message = require('../module/configMessages.js')
const codigoDAO = require('../../model/DAO/codigo_verificacao/codigo_verificacao.js')
const emailService = require('../../services/email.js')

const MINUTOS_EXPIRACAO = 10
const MAX_TENTATIVAS = 5

// gera o hash do código (HMAC com segredo do .env, já que um código de 6 dígitos é fácil de quebrar com hash simples)
const gerarHash = (email, finalidade, codigo) => {
    return crypto
        .createHmac('sha256', process.env.CODIGO_SECRET || '')
        .update(`${email}:${finalidade}:${codigo}`)
        .digest('hex')
}

// remove o hash antes de devolver para o cliente
const removerHash = (dados) => {
    if(Array.isArray(dados)) return dados.map(item => removerHash(item))

    if(dados && typeof dados == 'object'){
        let { codigo_hash, ...resto } = dados
        return resto
    }

    return dados
}

// gerar um novo código de verificação (fluxo real: recebe email e finalidade)
const gerarCodigoVerificacao = async (dados, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // 415

        if(dados == undefined || dados == null || typeof dados != 'object'){
            message.ERROR_BAD_REQUEST.field = '[CODIGO_VERIFICACAO] INVÁLIDO'
            return message.ERROR_BAD_REQUEST // 400
        }

        let validarEmail = validarEmailFinalidade(dados)
        if(validarEmail) return validarEmail // 400

        // código numérico de 4 dígitos
        let codigoPlano = String(crypto.randomInt(0, 10000)).padStart(4, '0')

        let novoCodigo = {
            email: dados.email.trim().toLowerCase(),
            finalidade: dados.finalidade.trim(),
            codigo_hash: '',
            data_expiracao: new Date(Date.now() + MINUTOS_EXPIRACAO * 60 * 1000)
        }
        novoCodigo.codigo_hash = gerarHash(novoCodigo.email, novoCodigo.finalidade, codigoPlano)

        // garante apenas um código ativo por email/finalidade
        let invalidar = await codigoDAO.invalidarCodigosPendentes(novoCodigo.email, novoCodigo.finalidade)
        if(!invalidar) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        let result = await codigoDAO.insertCodigoVerificacao(novoCodigo)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // envia o código por email (o código em texto puro não vai na resposta da API)
        let enviado = await emailService.enviarCodigoVerificacao(
            novoCodigo.email,
            codigoPlano,
            novoCodigo.finalidade,
            MINUTOS_EXPIRACAO
        )

        // se o email falhou, remove o código salvo para não deixar um código que o usuário nunca recebeu
        if(!enviado){
            await codigoDAO.deleteCodigoVerificacao(result)
            return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
        }

        novoCodigo.id_codigo = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, removerHash(novoCodigo))

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// validar o código informado pelo usuário
const validarCodigoVerificacao = async (dados, contentType, consumir = true) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // 415

        if(dados == undefined || dados == null || typeof dados != 'object'){
            message.ERROR_BAD_REQUEST.field = '[CODIGO_VERIFICACAO] INVÁLIDO'
            return message.ERROR_BAD_REQUEST // 400
        }

        let validarEmail = validarEmailFinalidade(dados)
        if(validarEmail) return validarEmail // 400

        if(typeof dados.codigo != 'string' || !/^\d{4}$/.test(dados.codigo)){
            message.ERROR_BAD_REQUEST.field = '[CODIGO] INVÁLIDO'
            return message.ERROR_BAD_REQUEST // 400
        }

        let email = dados.email.trim().toLowerCase()
        let finalidade = dados.finalidade.trim()

        let result = await codigoDAO.selectCodigoValidoByEmailFinalidade(email, finalidade)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // nenhum código ativo (inexistente, expirado ou já utilizado)
        if(result.length < 1){
            message.ERROR_BAD_REQUEST.field = '[CODIGO] INVÁLIDO OU EXPIRADO'
            return message.ERROR_BAD_REQUEST // 400
        }

        let registro = result[0]

        if(registro.tentativas >= MAX_TENTATIVAS){
            message.ERROR_BAD_REQUEST.field = '[CODIGO] LIMITE DE TENTATIVAS EXCEDIDO'
            return message.ERROR_BAD_REQUEST // 400
        }

        let hashInformado = Buffer.from(gerarHash(email, finalidade, dados.codigo))
        let hashSalvo = Buffer.from(String(registro.codigo_hash))

        let confere = hashInformado.length == hashSalvo.length &&
                      crypto.timingSafeEqual(hashInformado, hashSalvo)

        if(!confere){
            await codigoDAO.incrementarTentativas(registro.id_codigo)
            message.ERROR_BAD_REQUEST.field = '[CODIGO] INVÁLIDO OU EXPIRADO'
            return message.ERROR_BAD_REQUEST // 400
        }

        if(consumir){
            let consumo = await codigoDAO.marcarComoUtilizado(registro.id_codigo)
            if(!consumo) return message.ERROR_INTERNAL_SERVER_MODEL // 500

            // se nenhuma linha foi afetada, outra requisição já consumiu o código
            if(consumo[0].affectedRows < 1){
                message.ERROR_BAD_REQUEST.field = '[CODIGO] INVÁLIDO OU EXPIRADO'
                return message.ERROR_BAD_REQUEST // 400
            }
        }

        return await montarMensagem(message, message.SUCESS_RESPONSE, {
            id_codigo: registro.id_codigo,
            email: registro.email,
            finalidade: registro.finalidade
        }) // 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// inserir novo código (CRUD direto, espera o codigo_hash já pronto)
const inserirNovoCodigo = async (codigo, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(codigo, contentType)
        if(validar) return validar // 400 ou 415

        let result = await codigoDAO.insertCodigoVerificacao(codigo)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        codigo.id_codigo = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, removerHash(codigo))

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar código
const atualizarCodigo = async (codigo, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(codigo, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarCodigo(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        codigo.id_codigo = Number(id)
        let result = await codigoDAO.updateCodigoVerificacao(codigo)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, removerHash(codigo))

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todos os códigos
const listarCodigo = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await codigoDAO.selectAllCodigoVerificacao()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarCodigoMessage = await montarMensagem(message, message.SUCESS_RESPONSE, removerHash(result))
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarCodigoMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar código pelo id
const buscarCodigo = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        const validarID = await validarId(id)
        if(validarID) return validarID

        let result = await codigoDAO.selectByIdCodigoVerificacao(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, removerHash(result))

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir código pelo id
const excluirCodigo = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarCodigo(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await codigoDAO.deleteCodigoVerificacao(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// limpar códigos expirados (para rotina agendada)
const limparCodigosExpirados = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await codigoDAO.deleteCodigosExpirados()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// valida somente email e finalidade (usado em gerar e validar)
const validarEmailFinalidade = (dados) => {
    let message = JSON.parse(JSON.stringify(config_message))

    if(typeof dados.email != 'string' || dados.email.trim() == '' || dados.email.length > 255 ||
       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    if(typeof dados.finalidade != 'string' || dados.finalidade.trim() == '' || dados.finalidade.length > 30){
        message.ERROR_BAD_REQUEST.field = '[FINALIDADE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const validarDados = async (codigo, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(codigo == undefined || codigo == null || typeof codigo != 'object'){
        message.ERROR_BAD_REQUEST.field = '[CODIGO_VERIFICACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida email e finalidade obrigatórios
    let validarEmail = validarEmailFinalidade(codigo)
    if(validarEmail) return validarEmail // 400

    // Valida o hash obrigatório
    if(typeof codigo.codigo_hash != 'string' || codigo.codigo_hash.trim() == '' || codigo.codigo_hash.length > 255){
        message.ERROR_BAD_REQUEST.field = '[CODIGO_HASH] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de expiração obrigatória
    if(codigo.data_expiracao == undefined || codigo.data_expiracao == null || isNaN(new Date(codigo.data_expiracao).getTime())){
        message.ERROR_BAD_REQUEST.field = '[DATA_EXPIRACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data de utilização opcional
    if(codigo.data_utilizacao != undefined && codigo.data_utilizacao != null &&
       isNaN(new Date(codigo.data_utilizacao).getTime())){
        message.ERROR_BAD_REQUEST.field = '[DATA_UTILIZACAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida as tentativas opcionais
    if(codigo.tentativas != undefined && codigo.tentativas != null &&
       (!Number.isInteger(codigo.tentativas) || codigo.tentativas < 0)){
        message.ERROR_BAD_REQUEST.field = '[TENTATIVAS] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.codigo_verificacao = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    gerarCodigoVerificacao,
    validarCodigoVerificacao,
    inserirNovoCodigo,
    atualizarCodigo,
    listarCodigo,
    buscarCodigo,
    excluirCodigo,
    limparCodigosExpirados
}