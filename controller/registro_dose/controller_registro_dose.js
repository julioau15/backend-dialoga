/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela registroDose
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const registroDoseDAO = require('../../model/DAO/registro_dose/registro_dose.js')
const pacienteDAO = require('../../model/DAO/paciente/paciente.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')
const agenda = require('../module/agendaHorarios.js')

// a dose pode ser confirmada a partir de 30 min antes do horário
const MINUTOS_ANTECEDENCIA_CONFIRMACAO = 30
// depois de 60 min do horário a dose passa a ser exibida como atrasada
const MINUTOS_PARA_ATRASO = 60

// inserir nova registroDose
const inserirNovaRegistroDose = async (registroDose, idHorario, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(registroDose, contentType)
        if(validar) return validar // 400 ou 415

        let result = await registroDoseDAO.insertRegistroDose(registroDose, idHorario)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        registroDose.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, registroDose)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar registroDose
const atualizarRegistroDose = async (registroDose, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(registroDose, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarRegistroDose(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        registroDose.id = Number(id)
        let result = await registroDoseDAO.updateRegistroDose(registroDose)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, registroDose)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas registroDoses
const listarRegistroDose = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await registroDoseDAO.selectAllRegistroDose()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarRegistroDoseMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarRegistroDoseMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar registroDose pelo id
const buscarRegistroDose = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await registroDoseDAO.selectByIdRegistroDose(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir registroDose pelo id
const excluirRegistroDose = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarRegistroDose(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await registroDoseDAO.deleteRegistroDose(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas registroDoses pelo id do horario
const listarRegistroDoseByIdHorario = async (idHorario) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await registroDoseDAO.selectByIdHorario(idHorario)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        let listarRegistroDoseMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarRegistroDoseMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// marcar dose como tomada
const marcarDoseComoTomada = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let resultBuscarId = await buscarRegistroDose(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await registroDoseDAO.marcarDoseComoTomada(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// Converte 'HH:mm' em minutos do dia (ex.: '08:30' -> 510)
const paraMinutos = (hhmm) => {
    let [hora, minuto] = String(hhmm).split(':').map(Number)
    return hora * 60 + minuto
}

// Define a situação da dose de hoje: tomada, futura, pendente ou atrasada
const situacaoDaDose = (dose, horaAgora) => {
    if(String(dose.status ?? '').toLowerCase() == 'tomada') return 'tomada'

    let minutosAgora = paraMinutos(horaAgora)
    let minutosDose = paraMinutos(dose.horario)

    if(minutosDose - minutosAgora > MINUTOS_ANTECEDENCIA_CONFIRMACAO) return 'futura'
    if(minutosAgora - minutosDose > MINUTOS_PARA_ATRASO) return 'atrasada'
    return 'pendente'
}

// Descobre o id do paciente (tbl_paciente.id) a partir do token.
// O token traz o id do USUÁRIO; devolve { id } ou { erro: 'token' | 'paciente' }
const obterIdPacienteDoToken = async (token) => {
    let decodedToken = await decodeJWT(token)
    if(!decodedToken.status) return { erro: 'token' }

    let result = await pacienteDAO.selectByIdUsuarioPaciente(decodedToken.decode.id)
    if(!result || result.length < 1) return { erro: 'paciente' }

    return { id: result[0].id }
}

// listar as doses de hoje do paciente do token (uma por horário), com a situação de cada uma
const listarDosesDoDiaByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let paciente = await obterIdPacienteDoToken(token)
        if(paciente.erro == 'token') return message.ERROR_INVALID_TOKEN // 401
        if(paciente.erro) return message.ERROR_NOT_FOUND // 404 (o usuário do token não é um paciente)

        let agora = agenda.agoraNoFuso()
        let result = await registroDoseDAO.selectDosesDoDiaByIdPaciente(paciente.id, agora.data)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        let doses = result.map((dose) => {
            let situacao = situacaoDaDose(dose, agora.hora)
            return {
                id_horario_tratamento: dose.id_horario_tratamento,
                id_tratamento: dose.id_tratamento,
                nome_medicamento: dose.nome_medicamento,
                dosagem: dose.dosagem,
                horario: dose.horario,
                id_registro_dose: dose.id_registro_dose ?? null,
                status: situacao,
                pode_confirmar: situacao == 'pendente' || situacao == 'atrasada',
                data_hora_confirmacao: dose.data_hora_confirmacao ?? null
            }
        })

        // lista vazia também responde 200: a tela trata "sem doses hoje" sem erro
        message.DEFAULT_MESSAGE.status = message.SUCESS_RESPONSE.status
        message.DEFAULT_MESSAGE.status_code = message.SUCESS_RESPONSE.status_code
        message.DEFAULT_MESSAGE.response.data = agora.data
        message.DEFAULT_MESSAGE.response.count = doses.length
        message.DEFAULT_MESSAGE.response.doses = doses

        return message.DEFAULT_MESSAGE // 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// confirmar (marcar como tomada) a dose de hoje de um horário do paciente do token
const confirmarDoseByToken = async (token, idHorario) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validarID = await validarId(idHorario)
        if(validarID) return validarID // 400

        let paciente = await obterIdPacienteDoToken(token)
        if(paciente.erro == 'token') return message.ERROR_INVALID_TOKEN // 401
        if(paciente.erro) return message.ERROR_NOT_FOUND // 404

        // 404 também quando o horário é de outro paciente (não revela que ele existe)
        let horario = await registroDoseDAO.selectHorarioByIdAndIdPaciente(idHorario, paciente.id)
        if(!horario) return message.ERROR_INTERNAL_SERVER_MODEL // 500
        if(horario.length < 1) return message.ERROR_NOT_FOUND // 404

        let agora = agenda.agoraNoFuso()
        let situacao = situacaoDaDose({ horario: horario[0].horario }, agora.hora)

        if(situacao == 'futura'){
            message.ERROR_BAD_REQUEST.message = 'Esta dose ainda não pode ser confirmada. Tente perto do horário.'
            message.ERROR_BAD_REQUEST.field = '[HORARIO] AINDA NÃO DISPONÍVEL'
            return message.ERROR_BAD_REQUEST // 400
        }

        // datas gravadas no horário de São Paulo, no formato aceito pelo DATETIME
        let dataHoraPrevista = `${agora.data} ${horario[0].horario}:00`
        let dataHoraConfirmacao = `${agora.data} ${agora.hora}:00`

        let result = await registroDoseDAO.upsertDoseTomada(Number(idHorario), dataHoraPrevista, dataHoraConfirmacao)
        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, {
            id_horario_tratamento: Number(idHorario),
            data_hora_prevista: dataHoraPrevista,
            status: 'tomada'
        })

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (registroDose, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(registroDose == undefined || registroDose == null || typeof registroDose != 'object'){
        message.ERROR_BAD_REQUEST.field = '[REGISTRO_DOSE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data prevista
    if(registroDose.data_hora_prevista == undefined || registroDose.data_hora_prevista == null || String(registroDose.data_hora_prevista).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_HORA_PREVISTA] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o status
    if(typeof registroDose.status != 'string' || registroDose.status.trim() == '' || registroDose.status.length > 25){
        message.ERROR_BAD_REQUEST.field = '[STATUS] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a confirmação opcional
    if(registroDose.data_hora_confirmacao != undefined && registroDose.data_hora_confirmacao != null && String(registroDose.data_hora_confirmacao).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_HORA_CONFIRMACAO] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.registroDose = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovaRegistroDose,
    atualizarRegistroDose,
    listarRegistroDose,
    buscarRegistroDose,
    excluirRegistroDose,
    listarRegistroDoseByIdHorario,
    marcarDoseComoTomada,
    listarDosesDoDiaByToken,
    confirmarDoseByToken
}