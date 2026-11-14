/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela consulta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const consultaDAO = require('../../model/DAO/consulta/consulta.js')
const disponibilidadeDAO = require('../../model/DAO/disponibilidade/disponibilidade.js')
const notificacaoDAO = require('../../model/DAO/notificacao/notificacao.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')
const agenda = require('../module/agendaHorarios.js')

// ids de tbl_categoria (script-inserts.sql): 1 agenda/lembrete_consulta, 2 agenda/consulta_cancelada
const CATEGORIA_AGENDA = 1
const CATEGORIA_AGENDA_CANCELADA = 2

const nivelDoToken = (decode) =>
    decode.nivel == 0 ? "administrador"
    : decode.nivel == 1 ? "profissional"
    : decode.nivel == 2 ? "paciente"
    : false

const respostaErro = (status_code, message, field = null) => {
    let erro = { status: false, status_code, message }
    if(field) erro.field = field
    return erro
}

// o banco guarda o status do vínculo como '1' (ativo), mas o seed de teste usa texto
const vinculoAtivo = (status) => ['1', 'ativo'].includes(String(status).trim().toLowerCase())

// Carrega o vínculo e garante que quem está logado faz parte dele (paciente ou profissional do vínculo).
// Devolve { vinculo } ou { erro }.
const carregarVinculoDoUsuario = async (idVinculo, decode, nivel) => {
    let message = JSON.parse(JSON.stringify(config_message))

    let result = await consultaDAO.selectVinculoParaAgenda(idVinculo)
    if(!result) return { erro: message.ERROR_INTERNAL_SERVER_MODEL } // 500
    if(result.length < 1) return { erro: respostaErro(404, 'Vínculo não encontrado.') }

    let vinculo = result[0]
    let idUsuario = Number(decode.id)

    let ehDoVinculo = (nivel === 'paciente' && Number(vinculo.usuario_paciente) === idUsuario)
                   || (nivel === 'profissional' && Number(vinculo.usuario_profissional) === idUsuario)

    if(nivel !== 'administrador' && !ehDoVinculo){
        return { erro: respostaErro(403, 'Ação não permitida. Você não faz parte deste vínculo.') }
    }

    return { vinculo }
}

// vínculo precisa estar ativo e o paciente não pode estar inativo
const exigirVinculoAtivo = (vinculo) => {
    if(!vinculoAtivo(vinculo.status)){
        return respostaErro(403, 'Ação não permitida. Profissional e paciente precisam ter um vínculo ativo para marcar consultas.')
    }
    if(String(vinculo.status_paciente).toLowerCase() === 'inativo'){
        return respostaErro(403, 'Ação não permitida. Não é possível marcar consulta para paciente inativo.')
    }
    return false
}

/**
 * Regras de um agendamento (novo ou reagendado). Devolve { erro } ou { vinculo, data, hora, especialidade }:
 *  1. o vínculo existe, é do usuário logado e está ativo
 *  2. data e hora válidas e no futuro (nada de consulta no passado)
 *  3. a especialidade, se informada, é uma das do profissional (se ele tem só uma e nada veio, usa ela)
 *  4. quando quem marca é o PACIENTE, o horário precisa estar na disponibilidade do profissional
 *  5. o profissional não pode ter outra consulta no mesmo horário
 */
const validarAgendamento = async (consulta, decode, nivel, idConsultaIgnorar = 0) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // 1. vínculo
    let carregado = await carregarVinculoDoUsuario(Number(consulta.id_vinculo), decode, nivel)
    if(carregado.erro) return carregado
    let vinculo = carregado.vinculo

    let erroVinculo = exigirVinculoAtivo(vinculo)
    if(erroVinculo) return { erro: erroVinculo }

    // 2. data e hora
    let data = agenda.paraIsoData(consulta.data)
    if(!data) return { erro: respostaErro(400, 'Data inválida. Use o formato AAAA-MM-DD.', '[DATA] INVÁLIDO') }

    let hora = agenda.paraHoraHHmm(consulta.hora)
    if(!hora) return { erro: respostaErro(400, 'Horário inválido. Use o formato HH:mm.', '[HORA] INVÁLIDO') }

    let agora = agenda.agoraNoFuso()
    if(data < agora.data){
        return { erro: respostaErro(400, 'A data da consulta não pode ser anterior a hoje.', '[DATA] INVÁLIDO') }
    }
    if(agenda.jaPassou(data, hora, agora)){
        return { erro: respostaErro(400, 'Esse horário já passou. Escolha um horário futuro.', '[HORA] INVÁLIDO') }
    }

    // 3. especialidade
    let especialidades = await consultaDAO.selectEspecialidadesDoProfissional(vinculo.id_profissional)
    if(!especialidades) return { erro: message.ERROR_INTERNAL_SERVER_MODEL }
    let nomes = especialidades.map(e => e.especialidade)

    let especialidade = typeof consulta.especialidade === 'string' ? consulta.especialidade.trim() : ''
    if(especialidade === ''){
        especialidade = nomes.length === 1 ? nomes[0] : null
    } else if(nomes.length > 0 && !nomes.some(n => n.toLowerCase() === especialidade.toLowerCase())){
        return { erro: respostaErro(400, 'Essa especialidade não pertence ao profissional escolhido.', '[ESPECIALIDADE] INVÁLIDO') }
    }

    // 4. disponibilidade do profissional (vale para o paciente)
    let disponibilidades = await disponibilidadeDAO.selectDisponibilidadesComDiasByIdProfissional(vinculo.id_profissional)
    if(!disponibilidades) return { erro: message.ERROR_INTERNAL_SERVER_MODEL }

    if(nivel === 'paciente' && !agenda.horariosDoDia(disponibilidades, data).includes(hora)){
        return { erro: respostaErro(409, 'O profissional não atende nesse dia/horário. Escolha um dos horários disponíveis.', '[HORA] INDISPONÍVEL') }
    }

    // 5. horário livre
    let ocupadas = await consultaDAO.selectConsultasOcupadasDoProfissional(vinculo.id_profissional, data, data, Number(idConsultaIgnorar) || 0)
    if(!ocupadas) return { erro: message.ERROR_INTERNAL_SERVER_MODEL }

    let ocupadasNoDia = ocupadas.map(o => agenda.paraHoraHHmm(o.hora))
    if(agenda.conflitaComOcupadas(hora, ocupadasNoDia)){
        return { erro: respostaErro(409, 'Esse horário já está ocupado. Escolha outro.', '[HORA] INDISPONÍVEL') }
    }

    return { vinculo, data, hora, especialidade }
}

const dataBr = (iso) => iso.split('-').reverse().join('/')

// avisa o outro lado da consulta (a bolinha de "tem novidade" no app vem destas notificações não lidas)
const notificarConsulta = async (vinculo, nivelAutor, idCategoria, evento, texto) => {
    try {
        let destinos = []
        if(nivelAutor !== 'profissional') destinos.push({ id_profissional: vinculo.id_profissional, id_paciente: null })
        if(nivelAutor !== 'paciente') destinos.push({ id_profissional: null, id_paciente: vinculo.id_paciente })

        for (let destino of destinos) {
            await notificacaoDAO.insertNotificacao({
                titulo_mensagem: texto,
                lida: 0,
                referencia_evento: evento,
                id_categoria: idCategoria,
                ...destino
            })
        }
    } catch (error) { console.log(error) }
}

// inserir nova consulta
const inserirNovaConsulta = async (consulta, token, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let nivel = nivelDoToken(decodedToken.decode)
        if(!nivel) return respostaErro(403, 'Ação não permitida para este tipo de usuário.')

        let validar = await validarDados(consulta, contentType)
        if(validar) return validar // 400 ou 415

        // vínculo, data futura, especialidade, disponibilidade e horário livre
        let regras = await validarAgendamento(consulta, decodedToken.decode, nivel)
        if(regras.erro) return regras.erro

        consulta.criado_por = nivel
        consulta.data = regras.data
        consulta.hora = regras.hora + ':00'
        consulta.especialidade = regras.especialidade

        let result = await consultaDAO.insertConsulta(consulta)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        consulta.id = result
        consulta.id_paciente = regras.vinculo.id_paciente
        consulta.id_profissional = regras.vinculo.id_profissional

        await notificarConsulta(
            regras.vinculo, nivel, CATEGORIA_AGENDA, 'nova_consulta',
            `Nova consulta agendada para ${dataBr(regras.data)} às ${regras.hora}.`
        )

        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, consulta)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar consulta (reagendar)
const atualizarConsulta = async (consulta, token, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let nivel = nivelDoToken(decodedToken.decode)
        if(!nivel) return respostaErro(403, 'Ação não permitida para este tipo de usuário.')

        let validar = await validarDados(consulta, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarConsulta(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        // só quem faz parte do vínculo da consulta pode mexer nela
        let existente = resultBuscarId.response.consulta[0]
        let doDono = await carregarVinculoDoUsuario(Number(existente.id_vinculo), decodedToken.decode, nivel)
        if(doDono.erro) return doDono.erro

        let regras = await validarAgendamento(consulta, decodedToken.decode, nivel, Number(id))
        if(regras.erro) return regras.erro

        consulta.criado_por = existente.criado_por
        consulta.data = regras.data
        consulta.hora = regras.hora + ':00'
        consulta.especialidade = regras.especialidade
        consulta.id = Number(id)

        let result = await consultaDAO.updateConsulta(consulta)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        await notificarConsulta(
            regras.vinculo, nivel, CATEGORIA_AGENDA, 'consulta_alterada',
            `Uma consulta foi reagendada para ${dataBr(regras.data)} às ${regras.hora}.`
        )

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, consulta)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas consultas
const listarConsulta = async (filtro = {}) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await consultaDAO.selectAllConsulta(filtro)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarConsultaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarConsultaMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar consulta pelo id
const buscarConsulta = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await consultaDAO.selectByIdConsulta(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir (cancelar) consulta pelo id. Só quem faz parte do vínculo da consulta pode cancelar.
const excluirConsulta = async (id, token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let nivel = nivelDoToken(decodedToken.decode)
        if(!nivel) return respostaErro(403, 'Ação não permitida para este tipo de usuário.')

        let resultBuscarId = await buscarConsulta(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let existente = resultBuscarId.response.consulta[0]
        let doDono = await carregarVinculoDoUsuario(Number(existente.id_vinculo), decodedToken.decode, nivel)
        if(doDono.erro) return doDono.erro

        let result = await consultaDAO.deleteConsulta(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        let dia = agenda.paraIsoData(existente.data)
        let hora = agenda.paraHoraHHmm(existente.hora)
        await notificarConsulta(
            doDono.vinculo, nivel, CATEGORIA_AGENDA_CANCELADA, 'consulta_cancelada',
            dia && hora ? `A consulta de ${dataBr(dia)} às ${hora} foi cancelada.` : 'Uma consulta foi cancelada.'
        )

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// dias e horários livres do profissional de um vínculo (para o paciente escolher no app).
// Só entram datas futuras, dentro da disponibilidade do profissional e sem consulta marcada.
const listarHorariosDoVinculo = async (idVinculo, token, filtro = {}) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let nivel = nivelDoToken(decodedToken.decode)
        if(!nivel) return respostaErro(403, 'Ação não permitida para este tipo de usuário.')

        const validarID = await validarId(idVinculo)
        if(validarID) return validarID

        let carregado = await carregarVinculoDoUsuario(Number(idVinculo), decodedToken.decode, nivel)
        if(carregado.erro) return carregado.erro
        let vinculo = carregado.vinculo

        let erroVinculo = exigirVinculoAtivo(vinculo)
        if(erroVinculo) return erroVinculo

        let agora = agenda.agoraNoFuso()
        let quantosDias = Math.min(Math.max(parseInt(filtro.dias) || 60, 1), 180)
        let ate = agenda.somarDias(agora.data, quantosDias)

        let disponibilidades = await disponibilidadeDAO.selectDisponibilidadesComDiasByIdProfissional(vinculo.id_profissional)
        if(!disponibilidades) return message.ERROR_INTERNAL_SERVER_MODEL

        let ocupadas = await consultaDAO.selectConsultasOcupadasDoProfissional(vinculo.id_profissional, agora.data, ate)
        if(!ocupadas) return message.ERROR_INTERNAL_SERVER_MODEL

        let especialidades = await consultaDAO.selectEspecialidadesDoProfissional(vinculo.id_profissional)
        if(!especialidades) return message.ERROR_INTERNAL_SERVER_MODEL

        let ocupadasTexto = ocupadas
            .map(o => `${agenda.paraIsoData(o.data)} ${agenda.paraHoraHHmm(o.hora)}`)

        let dias = agenda.diasComHorariosLivres(disponibilidades, ocupadasTexto, agora.data, ate, agora)

        message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
        message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
        message.DEFAULT_MESSAGE.message = message.SUCESS_RESPONSE.message
        message.DEFAULT_MESSAGE.response.horarios = {
            id_vinculo: vinculo.id,
            id_profissional: vinculo.id_profissional,
            profissional_nome: vinculo.profissional_nome,
            especialidades: especialidades.map(e => e.especialidade),
            duracao_minutos: agenda.DURACAO_MINUTOS,
            cadastrou_disponibilidade: disponibilidades.length > 0,
            dias
        }

        return message.DEFAULT_MESSAGE // 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const pacienteDAO = require('../../model/DAO/paciente/paciente.js')

// listar consultas do paciente pelo token
const listarConsultasByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let resultPaciente = await pacienteDAO.selectByIdUsuarioPaciente(decodedToken.decode.id)
        if(!resultPaciente) return message.ERROR_INTERNAL_SERVER_MODEL // 500
        if(resultPaciente.length < 1) return message.ERROR_NOT_FOUND // 404

        let result = await consultaDAO.selectConsultasByIdPaciente(resultPaciente[0].id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500
        if(result.length <= 0) return message.ERROR_NOT_FOUND // 404

        let listarConsultaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarConsultaMessage // 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// lembre de exportar: listarConsultasByToken

// listar consultas dos pacientes do profissional logado (GET /profissionais/me/consultas)
const listarConsultasByTokenProfissional = async (token, filtro = {}) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN // 401

        const profissionalDAO = require('../../model/DAO/profissional/profissional.js')
        let resultProfissional = await profissionalDAO.selectByIdUsuarioProfissional(decodedToken.decode.id)
        if(!resultProfissional) return message.ERROR_INTERNAL_SERVER_MODEL // 500
        if(resultProfissional.length < 1) return message.ERROR_NOT_FOUND // 404

        let result = await consultaDAO.selectConsultasByIdProfissional(resultProfissional[0].id, filtro)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500
        if(result.length <= 0) return message.ERROR_NOT_FOUND // 404

        let listarConsultaMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarConsultaMessage // 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (consulta, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(consulta == undefined || consulta == null || typeof consulta != 'object'){
        message.ERROR_BAD_REQUEST.field = '[CONSULTA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o nome da consulta
    if(typeof consulta.nome_da_consulta != 'string' || consulta.nome_da_consulta.trim() == '' || consulta.nome_da_consulta.length > 150){
        message.ERROR_BAD_REQUEST.field = '[NOME_DA_CONSULTA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a especialidade opcional
    if(consulta.especialidade != undefined && consulta.especialidade != null &&
       (typeof consulta.especialidade != 'string' || consulta.especialidade.length > 100)){
        message.ERROR_BAD_REQUEST.field = '[ESPECIALIDADE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data da consulta
    if(consulta.data == undefined || consulta.data == null || String(consulta.data).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o horário da consulta
    if(consulta.hora == undefined || consulta.hora == null || String(consulta.hora).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[HORA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o vínculo relacionado
    if(consulta.id_vinculo == undefined || consulta.id_vinculo == null || !Number.isInteger(Number(consulta.id_vinculo)) || Number(consulta.id_vinculo) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_VINCULO] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.consulta = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovaConsulta,
    atualizarConsulta,
    listarConsulta,
    buscarConsulta,
    excluirConsulta,
    listarHorariosDoVinculo,
    listarConsultasByToken,
    listarConsultasByTokenProfissional
}