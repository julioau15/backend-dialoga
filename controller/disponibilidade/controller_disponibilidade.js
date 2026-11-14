/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela disponibilidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const disponibilidadeDAO = require('../../model/DAO/disponibilidade/disponibilidade.js')
const diasDaSemanaDisponibilidadeController = require('../dias_da_semana_disponibilidade/controller_dias_da_semana_disponibilidade.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')
const agenda = require('../module/agendaHorarios.js')

// o token traz o id do USUÁRIO; a disponibilidade guarda o id do PROFISSIONAL
const obterIdProfissionalDoToken = async (idUsuario) => {
    const profissionalDAO = require('../../model/DAO/profissional/profissional.js')
    let result = await profissionalDAO.selectByIdUsuarioProfissional(idUsuario)
    if(!result || result.length < 1) return false
    return result[0].id
}

// inserir nova disponibilidade
const inserirNovaDisponibilidade = async (disponibilidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let validar = await validarDados(disponibilidade, contentType)
        if(validar) return validar // 400 ou 415

        let result = await disponibilidadeDAO.insertDisponibilidade(disponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        disponibilidade.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, disponibilidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar disponibilidade
const atualizarDisponibilidade = async (disponibilidade, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(disponibilidade, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarDisponibilidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        disponibilidade.id = Number(id)
        let result = await disponibilidadeDAO.updateDisponibilidade(disponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, disponibilidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas disponibilidades
const listarDisponibilidade = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await disponibilidadeDAO.selectAllDisponibilidade()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        // busca os dias da semana de cada disponibilidade
        for (let disponibilidade of result) {
            let diasDaSemana = await diasDaSemanaDisponibilidadeController.listarDiasDaSemanaByIdDisponibilidade(disponibilidade.id)

            if(diasDaSemana.status){
                disponibilidade.dias_da_semana = diasDaSemana.response.diasDaSemanaDisponibilidade
            }

        }

        let listarDisponibilidadeMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarDisponibilidadeMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar disponibilidade pelo id
const buscarDisponibilidade = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await disponibilidadeDAO.selectByIdDisponibilidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        // busca os dias da semana de cada disponibilidade
        for (let disponibilidade of result) {
            let diasDaSemana = await diasDaSemanaDisponibilidadeController.listarDiasDaSemanaByIdDisponibilidade(disponibilidade.id)

            if(diasDaSemana.status){
                disponibilidade.dias_da_semana = diasDaSemana.response.diasDaSemanaDisponibilidade
            }

        }

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir disponibilidade pelo id (só o profissional dono pode excluir)
const excluirDisponibilidade = async (id, token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let resultBuscarId = await buscarDisponibilidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        // administrador pode tudo; profissional só a própria
        if(decodedToken.decode.nivel != 0){
            let idProfissional = await obterIdProfissionalDoToken(decodedToken.decode.id)
            if(!idProfissional || Number(resultBuscarId.response.disponibilidade[0].id_profissional) !== Number(idProfissional)){
                return { status: false, status_code: 403, message: 'Ação não permitida. Esta disponibilidade é de outro profissional.' }
            }
        }

        let result = await disponibilidadeDAO.deleteDisponibilidade(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const listarDisponibilidadeByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let idProfissional = await obterIdProfissionalDoToken(decodedToken.decode.id)
        if(!idProfissional) return message.ERROR_NOT_FOUND // 404

        let result = await disponibilidadeDAO.selectAllDisponibilidadeByIdProfissional(idProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verifica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // 404

        // busca os dias da semana de cada disponibilidade
        for (let disponibilidade of result) {
            let diasDaSemana = await diasDaSemanaDisponibilidadeController.listarDiasDaSemanaByIdDisponibilidade(disponibilidade.id)

            if(diasDaSemana.status){
                disponibilidade.dias_da_semana = diasDaSemana.response.diasDaSemanaDisponibilidade
            }

        }

        let listarDisponibilidadeMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarDisponibilidadeMessage // 200

    } catch (error) {
        console.log(error)
    }

    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// inserir nova disponibilidade de um profissional pelo token
const inserirNovaDisponibilidadeByToken = async (disponibilidade, token, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))
    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let idProfissional = await obterIdProfissionalDoToken(decodedToken.decode.id)
        if(!idProfissional) return message.ERROR_NOT_FOUND // 404

        disponibilidade.id_profissional = idProfissional

        let validar = await validarDados(disponibilidade, contentType)
        if(validar) return validar // 400 ou 415

        let result = await disponibilidadeDAO.insertDisponibilidadeByIdProfissional(disponibilidade, idProfissional)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL

        // insere os novos dias da semana
        for (let diaDaSemana of disponibilidade?.dias_da_semana || []) {
            let dadosDiasDaSemana = {
                id_dias_da_semana: diaDaSemana,
                id_disponibilidade: result
            }

            let resultInserir = await diasDaSemanaDisponibilidadeController
                .inserirNovoDiasDaSemanaDisponibilidade(
                    dadosDiasDaSemana,
                    contentType
                )

            if(!resultInserir.status) return resultInserir
        }

        disponibilidade.id = result
        return await montarMensagem(message, message.SUCESS_CREATED_ITEM, disponibilidade)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar disponibilidade pelo token
const atualizarDisponibilidadeByToken = async (disponibilidade, token, id, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let idProfissional = await obterIdProfissionalDoToken(decodedToken.decode.id)
        if(!idProfissional) return message.ERROR_NOT_FOUND // 404

        disponibilidade.id_profissional = idProfissional

        let validar = await validarDados(disponibilidade, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarDisponibilidade(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        // só o dono pode alterar a própria disponibilidade
        if(Number(resultBuscarId.response.disponibilidade[0].id_profissional) !== Number(idProfissional)){
            return { status: false, status_code: 403, message: 'Ação não permitida. Esta disponibilidade é de outro profissional.' }
        }

        disponibilidade.id = Number(id)

        let result = await disponibilidadeDAO.updateDisponibilidade(disponibilidade)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // exclui os dias da semana anteriores
        let resultExcluir = await diasDaSemanaDisponibilidadeController
            .excluirDiasDaSemanaDisponibilidadeByIdDisponibilidade(id)

        // insere os novos dias da semana
        for (let diaDaSemana of disponibilidade?.dias_da_semana || []) {
            let dadosDiasDaSemana = {
                id_dias_da_semana: diaDaSemana,
                id_disponibilidade: Number(id)
            }

            let resultInserir = await diasDaSemanaDisponibilidadeController
                .inserirNovoDiasDaSemanaDisponibilidade(
                    dadosDiasDaSemana,
                    contentType
                )

            if(!resultInserir.status) return resultInserir
        }

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, disponibilidade)

    } catch (error) {
        console.log(error)
    }

    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const validarDados = async (disponibilidade, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Valida o formato da requisição
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o objeto foi informado
    if(disponibilidade == undefined || disponibilidade == null || typeof disponibilidade != 'object'){
        message.ERROR_BAD_REQUEST.field = '[DISPONIBILIDADE] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a hora inicial
    if(disponibilidade.hora_inicio == undefined || disponibilidade.hora_inicio == null || String(disponibilidade.hora_inicio).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[HORA_INICIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a hora final
    if(disponibilidade.hora_fim == undefined || disponibilidade.hora_fim == null || String(disponibilidade.hora_fim).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[HORA_FIM] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida o tipo de repetição
    if(typeof disponibilidade.tipo_repeticao != 'string' || disponibilidade.tipo_repeticao.trim() == '' || disponibilidade.tipo_repeticao.length > 20){
        message.ERROR_BAD_REQUEST.field = '[TIPO_REPETICAO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data inicial opcional
    if(disponibilidade.data_inicial != undefined && disponibilidade.data_inicial != null && String(disponibilidade.data_inicial).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_INICIAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a data final opcional
    if(disponibilidade.data_final != undefined && disponibilidade.data_final != null && String(disponibilidade.data_final).trim() == ''){
        message.ERROR_BAD_REQUEST.field = '[DATA_FINAL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Horários no formato HH:mm e fim depois do início
    let horaInicio = agenda.paraHoraHHmm(disponibilidade.hora_inicio)
    let horaFim = agenda.paraHoraHHmm(disponibilidade.hora_fim)
    if(!horaInicio){
        message.ERROR_BAD_REQUEST.field = '[HORA_INICIO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }
    if(!horaFim || horaFim <= horaInicio){
        message.ERROR_BAD_REQUEST.field = '[HORA_FIM] INVÁLIDO (precisa ser depois da hora inicial)'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Tipo de repetição: unica | semanal | periodo
    let tipo = disponibilidade.tipo_repeticao.trim().toLowerCase()
    if(!['unica', 'semanal', 'periodo'].includes(tipo)){
        message.ERROR_BAD_REQUEST.field = '[TIPO_REPETICAO] INVÁLIDO (use unica, semanal ou periodo)'
        return message.ERROR_BAD_REQUEST // 400
    }
    disponibilidade.tipo_repeticao = tipo

    // Datas: unica precisa de data_inicial; periodo precisa das duas, com o fim depois do início
    let dataInicial = agenda.paraIsoData(disponibilidade.data_inicial)
    let dataFinal = agenda.paraIsoData(disponibilidade.data_final)
    if((tipo === 'unica' || tipo === 'periodo') && !dataInicial){
        message.ERROR_BAD_REQUEST.field = '[DATA_INICIAL] OBRIGATÓRIA PARA ESTE TIPO'
        return message.ERROR_BAD_REQUEST // 400
    }
    if(tipo === 'periodo' && (!dataFinal || dataFinal < dataInicial)){
        message.ERROR_BAD_REQUEST.field = '[DATA_FINAL] INVÁLIDA (precisa ser igual ou depois da inicial)'
        return message.ERROR_BAD_REQUEST // 400
    }
    if(tipo === 'unica') dataFinal = dataInicial
    disponibilidade.data_inicial = dataInicial
    disponibilidade.data_final = dataFinal

    // Dias da semana (1 = Domingo ... 7 = Sábado): obrigatórios em semanal e periodo
    if(tipo !== 'unica'){
        let dias = disponibilidade.dias_da_semana
        if(!Array.isArray(dias) || dias.length < 1 || dias.some(d => !Number.isInteger(Number(d)) || Number(d) < 1 || Number(d) > 7)){
            message.ERROR_BAD_REQUEST.field = '[DIAS_DA_SEMANA] INVÁLIDO (informe ids de 1 a 7)'
            return message.ERROR_BAD_REQUEST // 400
        }
    }

    // Valida o profissional relacionado
    if(disponibilidade.id_profissional == undefined || disponibilidade.id_profissional == null || !Number.isInteger(Number(disponibilidade.id_profissional)) || Number(disponibilidade.id_profissional) <= 0){
        message.ERROR_BAD_REQUEST.field = '[ID_PROFISSIONAL] INVÁLIDO'
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

    if(response != null) base.DEFAULT_MESSAGE.response.disponibilidade = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}


module.exports = {
    inserirNovaDisponibilidade,
    atualizarDisponibilidade,
    listarDisponibilidade,
    buscarDisponibilidade,
    excluirDisponibilidade,
    listarDisponibilidadeByToken,
    inserirNovaDisponibilidadeByToken,
    atualizarDisponibilidadeByToken
}