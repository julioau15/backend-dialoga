/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela registroDose
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de registroDose
const insertRegistroDose = async (registroDose, idHorario) => {
    let sql = `INSERT INTO tbl_registro_dose (data_hora_prevista, status, data_hora_confirmacao, id_horario_tratamento)
               VALUES (?, ?, ?, ?)`

    let dataHoraConfirmacao = registroDose?.status.toLowerCase() == 'pendente'
    ? null
    : new Date();

    try {
        let response = await knexConex.raw(sql, [
            registroDose.data_hora_prevista ? registroDose.data_hora_prevista : null,
            registroDose.status,
            dataHoraConfirmacao,
            idHorario
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de registroDose
const updateRegistroDose = async (registroDose) => {
    let sql = `UPDATE tbl_registro_dose
               SET data_hora_prevista = ?,
                   status = ?,
                   data_hora_confirmacao = now(),
                   id_horario_tratamento = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [registroDose.data_hora_prevista, registroDose.status, registroDose.id_horario_tratamento, registroDose.id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas registroDoses
const selectAllRegistroDose = async () => {
    let sql = `SELECT
                   id,
                   data_hora_prevista,
                   status,
                   data_hora_confirmacao,
                   id_horario_tratamento
               FROM tbl_registro_dose
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma registroDose pelo id
const selectByIdRegistroDose = async (id) => {
    let sql = `SELECT
                   id,
                   data_hora_prevista,
                   status,
                   data_hora_confirmacao,
                   id_horario_tratamento
               FROM tbl_registro_dose
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de registroDose
const deleteRegistroDose = async (id) => {
    let sql = `DELETE FROM tbl_registro_dose
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// marcar registro como tomado
const marcarDoseComoTomada = async (id) => {
    let sql = `UPDATE tbl_registro_dose
               SET 
                   status = "tomada",
                   data_hora_confirmacao = now()
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de uma registroDose pelo id do horario
const selectByIdHorario = async (idHorario) => {
    let sql = `SELECT
                   id,
                   data_hora_prevista,
                   status,
                   data_hora_confirmacao,
                   id_horario_tratamento
               FROM tbl_registro_dose
               WHERE id_horario_tratamento = ?`
    try {
        let response = await knexConex.raw(sql, [idHorario])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// select das doses de hoje de um paciente: uma linha por horário de tratamento,
// com o registro daquele dia quando ele existir (LEFT JOIN)
const selectDosesDoDiaByIdPaciente = async (idPaciente, data) => {
    let sql = `SELECT
                   h.id AS id_horario_tratamento,
                   TIME_FORMAT(h.horario, '%H:%i') AS horario,
                   t.id AS id_tratamento,
                   t.nome_medicamento,
                   t.dosagem,
                   r.id AS id_registro_dose,
                   r.status,
                   DATE_FORMAT(r.data_hora_confirmacao, '%Y-%m-%d %H:%i:%s') AS data_hora_confirmacao
               FROM tbl_horario_tratamento AS h
               INNER JOIN tbl_tratamento AS t ON t.id = h.id_tratamento
               LEFT JOIN tbl_registro_dose AS r
                      ON r.id_horario_tratamento = h.id
                     AND r.data_hora_prevista = TIMESTAMP(?, h.horario)
               WHERE t.id_paciente = ?
               ORDER BY h.horario ASC, t.nome_medicamento ASC`
    try {
        let response = await knexConex.raw(sql, [data, idPaciente])

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

// select de um horário de tratamento somente se ele pertencer ao paciente informado
// (garante que um paciente não confirme a dose de outro)
const selectHorarioByIdAndIdPaciente = async (idHorario, idPaciente) => {
    let sql = `SELECT
                   h.id,
                   TIME_FORMAT(h.horario, '%H:%i') AS horario,
                   h.id_tratamento
               FROM tbl_horario_tratamento AS h
               INNER JOIN tbl_tratamento AS t ON t.id = h.id_tratamento
               WHERE h.id = ? AND t.id_paciente = ?`
    try {
        let response = await knexConex.raw(sql, [idHorario, idPaciente])

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

// grava a dose como tomada; se o registro do dia já existir (ex.: criado pelo lembrete), só atualiza.
// Se a dose já estava tomada, mantém a hora da primeira confirmação.
// Obs.: no ON DUPLICATE KEY UPDATE as atribuições rodam da esquerda para a direita,
// por isso a data é decidida antes de o status mudar.
const upsertDoseTomada = async (idHorario, dataHoraPrevista, dataHoraConfirmacao) => {
    let sql = `INSERT INTO tbl_registro_dose (data_hora_prevista, status, data_hora_confirmacao, id_horario_tratamento)
               VALUES (?, 'tomada', ?, ?)
               ON DUPLICATE KEY UPDATE
                   data_hora_confirmacao = IF(status = 'tomada', data_hora_confirmacao, ?),
                   status = 'tomada'`
    try {
        let response = await knexConex.raw(sql, [dataHoraPrevista, dataHoraConfirmacao, idHorario, dataHoraConfirmacao])

        if(response) return true

    } catch (error) { console.log(error) }

    return false
}

// cria o registro pendente da dose do dia (se ainda não existir) e devolve o id dele.
// LAST_INSERT_ID(id) faz o insertId devolver o id do registro que já existia.
const insertDosePendente = async (idHorario, dataHoraPrevista) => {
    let sql = `INSERT INTO tbl_registro_dose (data_hora_prevista, status, data_hora_confirmacao, id_horario_tratamento)
               VALUES (?, 'pendente', NULL, ?)
               ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`
    try {
        let response = await knexConex.raw(sql, [dataHoraPrevista, idHorario])

        if(response) return response[0].insertId

    } catch (error) { console.log(error) }

    return false
}

// select dos horários com lembrete ativo que vencem entre horaInicio e horaFim (fuso de São Paulo),
// ignorando pacientes que desligaram o lembrete de medicação e doses que já foram tomadas no dia
const selectHorariosParaLembrete = async (data, horaInicio, horaFim) => {
    let sql = `SELECT
                   h.id AS id_horario_tratamento,
                   TIME_FORMAT(h.horario, '%H:%i:%s') AS horario,
                   t.nome_medicamento,
                   t.dosagem,
                   t.id_paciente
               FROM tbl_horario_tratamento AS h
               INNER JOIN tbl_tratamento AS t ON t.id = h.id_tratamento
               WHERE t.lembrete_ativo = 1
                 AND h.horario >= ?
                 AND h.horario <= ?
                 AND NOT EXISTS (
                     SELECT 1 FROM tbl_preferencia_notificacao AS p
                     WHERE p.id_paciente = t.id_paciente
                       AND p.categoria = 'medicacao'
                       AND (p.tipo_especifico = 'hora_da_dose' OR p.tipo_especifico IS NULL)
                       AND p.ativo = 0
                 )
                 AND NOT EXISTS (
                     SELECT 1 FROM tbl_registro_dose AS r
                     WHERE r.id_horario_tratamento = h.id
                       AND r.data_hora_prevista = TIMESTAMP(?, h.horario)
                       AND r.status = 'tomada'
                 )`
    try {
        let response = await knexConex.raw(sql, [horaInicio, horaFim, data])

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertRegistroDose,
    updateRegistroDose,
    selectAllRegistroDose,
    selectByIdRegistroDose,
    deleteRegistroDose,
    selectByIdHorario,
    marcarDoseComoTomada,
    selectDosesDoDiaByIdPaciente,
    selectHorarioByIdAndIdPaciente,
    upsertDoseTomada,
    insertDosePendente,
    selectHorariosParaLembrete
}