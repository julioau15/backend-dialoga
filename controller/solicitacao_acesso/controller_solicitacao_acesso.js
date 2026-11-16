/*************************************************************************************
 * Objetivo: Validar e gerenciar solicitações de acesso e categorias compartilhadas.
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const solicitacaoAcessoDAO = require('../../model/DAO/solicitacao_acesso/solicitacao_acesso.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')

const categoriasPermitidas = ['Sentimento', 'Energia', 'Humor', 'Pensamentos', 'Horas de sono', 'Acontecimentos']

// Consulta o perfil correspondente ao usuário autenticado.
const buscarPerfilDoUsuario = async (token, nivelEsperado = null) => {
    let message = JSON.parse(JSON.stringify(config_message))
    let decodedToken = await decodeJWT(token)
    if (!decodedToken.status) return message.ERROR_INVALID_TOKEN

    let nivel = Number(decodedToken.decode.nivel)
    if (nivelEsperado != null && nivel != nivelEsperado) return message.ERROR_FORBIDDEN
    if (nivel == 0 && nivelEsperado == null) return { status: true, id: null, nivel: 0 }
    if (nivel != 1 && nivel != 2) return message.ERROR_FORBIDDEN

    let result = await solicitacaoAcessoDAO.selectPerfilByIdUsuario(decodedToken.decode.id, nivel)
    if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
    if (result.length < 1) return message.ERROR_NOT_FOUND
    return { status: true, id: result[0].id, nivel: nivel }
}

const validarId = (id) => {
    let message = JSON.parse(JSON.stringify(config_message))
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
        message.ERROR_BAD_REQUEST.field = '[ID] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }
    return false
}

const validarCategorias = (categorias) => {
    let message = JSON.parse(JSON.stringify(config_message))
    if (!Array.isArray(categorias)) return message.ERROR_BAD_REQUEST
    for (let categoria of categorias) {
        if (!categoriasPermitidas.includes(categoria)) {
            message.ERROR_BAD_REQUEST.field = '[CATEGORIA] INVÁLIDA'
            return message.ERROR_BAD_REQUEST
        }
    }
    return false
}

// Em bases antigas, usa a última escolha quando houver categorias duplicadas.
const obterCategoriasAutorizadas = (categorias) => {
    let escolhas = {}
    for (let item of categorias) {
        escolhas[item.categoria] = Number(item.autorizado) == 1
    }
    return categoriasPermitidas.filter(categoria => escolhas[categoria] == true)
}

// Apenas o paciente dono da solicitação pode responder, editar ou remover.
const buscarSolicitacaoDoPaciente = async (token, id, statusEsperado = null) => {
    let message = JSON.parse(JSON.stringify(config_message))
    let validar = validarId(id)
    if (validar) return validar

    let paciente = await buscarPerfilDoUsuario(token, 2)
    if (!paciente.status) return paciente

    let result = await solicitacaoAcessoDAO.selectByIdSolicitacaoAcesso(Number(id))
    if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
    if (result.length < 1 || result[0].id_paciente != paciente.id) return message.ERROR_NOT_FOUND
    if (statusEsperado != null && result[0].status != statusEsperado) return mensagemConflito()

    return { status: true, solicitacao: result[0] }
}

const inserirNovaSolicitacaoAcesso = async (token, idPaciente) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = validarId(idPaciente)
        if (validar) return validar

        let profissional = await buscarPerfilDoUsuario(token, 1)
        if (!profissional.status) return profissional

        let solicitacao = { id_profissional: profissional.id, id_paciente: Number(idPaciente) }
        let result = await solicitacaoAcessoDAO.insertSolicitacaoAcesso(solicitacao)
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if (result.semVinculo) return message.ERROR_FORBIDDEN

        let status = result.criada ? message.SUCESS_CREATED_ITEM : message.SUCESS_RESPONSE
        return montarMensagem(message, status, result.solicitacao)
    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

const listarSolicitacaoAcesso = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let perfil = await buscarPerfilDoUsuario(token)
        if (!perfil.status) return perfil

        let result = await solicitacaoAcessoDAO.selectSolicitacoesByPerfil(perfil.id, perfil.nivel)
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
        for (let solicitacao of result) {
            let categorias = await solicitacaoAcessoDAO.selectCategoriasByIdSolicitacao(solicitacao.id)
            if (!categorias) return message.ERROR_INTERNAL_SERVER_MODEL
            solicitacao.categorias = obterCategoriasAutorizadas(categorias)
        }

        message.DEFAULT_MESSAGE.response.count = result.length
        return montarMensagem(message, message.SUCESS_RESPONSE, result)
    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

const aprovarSolicitacaoAcesso = async (token, id, categorias = []) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = validarCategorias(categorias)
        if (validar) return validar

        let resultadoBusca = await buscarSolicitacaoDoPaciente(token, id, 'pendente')
        if (!resultadoBusca.status) return resultadoBusca

        let categoriasSelecionadas = [...new Set(categorias)]
        let result = await solicitacaoAcessoDAO.updateCompartilhamentoSolicitacao(
            resultadoBusca.solicitacao, 'pendente', 'aprovada', categoriasSelecionadas
        )
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if (result.conflito) return mensagemConflito()

        return montarMensagem(message, message.SUCESS_UPDATE_ITEM, result.solicitacao)
    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

const atualizarCategoriasCompartilhadas = async (token, id, categorias) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = validarCategorias(categorias)
        if (validar) return validar

        let resultadoBusca = await buscarSolicitacaoDoPaciente(token, id, 'aprovada')
        if (!resultadoBusca.status) return resultadoBusca

        let categoriasSelecionadas = [...new Set(categorias)]
        let result = await solicitacaoAcessoDAO.updateCompartilhamentoSolicitacao(
            resultadoBusca.solicitacao, 'aprovada', 'aprovada', categoriasSelecionadas
        )
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if (result.conflito) return mensagemConflito()

        return montarMensagem(message, message.SUCESS_UPDATE_ITEM, result.solicitacao)
    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

const reprovarSolicitacaoAcesso = async (token, id) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let resultadoBusca = await buscarSolicitacaoDoPaciente(token, id, 'pendente')
        if (!resultadoBusca.status) return resultadoBusca

        let result = await solicitacaoAcessoDAO.updateCompartilhamentoSolicitacao(
            resultadoBusca.solicitacao, 'pendente', 'reprovada', []
        )
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if (result.conflito) return mensagemConflito()

        return montarMensagem(message, message.SUCESS_UPDATE_ITEM, result.solicitacao)
    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

const excluirSolicitacaoAcesso = async (token, id) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let resultadoBusca = await buscarSolicitacaoDoPaciente(token, id)
        if (!resultadoBusca.status) return resultadoBusca

        let result = await solicitacaoAcessoDAO.deleteSolicitacaoAcesso(resultadoBusca.solicitacao)
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if (result.conflito) return mensagemConflito()

        return montarMensagem(message, message.SUCESS_DELETE_ITEM)
    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// Retorna somente os campos que o paciente autorizou.
const listarIndicadoresCompartilhados = async (token, idPaciente) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = validarId(idPaciente)
        if (validar) return validar

        let profissional = await buscarPerfilDoUsuario(token, 1)
        if (!profissional.status) return profissional

        let result = await solicitacaoAcessoDAO.selectIndicadoresCompartilhados(profissional.id, Number(idPaciente))
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL
        if (result.semVinculo) return message.ERROR_FORBIDDEN

        let categorias = obterCategoriasAutorizadas(result.categorias)
        let registros = []
        if (result.status == 'aprovada' && categorias.length > 0) {
            for (let registro of result.registros) {
                let compartilhado = { id: registro.id, data: registro.data }
                if (categorias.includes('Sentimento')) compartilhado.sentimento = registro.sentimento
                if (categorias.includes('Energia')) compartilhado.energia = registro.energia
                if (categorias.includes('Humor')) compartilhado.humor = registro.humor
                if (categorias.includes('Pensamentos')) compartilhado.padrao_pensamentos = registro.padrao_pensamentos
                if (categorias.includes('Horas de sono')) compartilhado.horas_sono = registro.horas_sono
                if (categorias.includes('Acontecimentos')) compartilhado.relato = registro.relato
                registros.push(compartilhado)
            }
        }

        let resposta = montarMensagem(message, message.SUCESS_RESPONSE)
        resposta.response = { status: result.status, categorias: categorias, registroHumor: registros }
        return resposta
    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

const mensagemConflito = () => {
    let message = JSON.parse(JSON.stringify(config_message))
    message.ERROR_CONFLICT.message = 'A solicitação foi alterada. Atualize a lista e tente novamente.'
    return message.ERROR_CONFLICT
}

const montarMensagem = (base, status, response = null) => {
    base.DEFAULT_MESSAGE.status = status.status
    base.DEFAULT_MESSAGE.status_code = status.status_code
    base.DEFAULT_MESSAGE.message = status.message
    if (response != null) base.DEFAULT_MESSAGE.response.solicitacaoAcesso = response
    return base.DEFAULT_MESSAGE
}

module.exports = {
    inserirNovaSolicitacaoAcesso,
    listarSolicitacaoAcesso,
    aprovarSolicitacaoAcesso,
    atualizarCategoriasCompartilhadas,
    reprovarSolicitacaoAcesso,
    excluirSolicitacaoAcesso,
    listarIndicadoresCompartilhados
}
