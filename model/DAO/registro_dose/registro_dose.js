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

module.exports = {
    insertRegistroDose,
    updateRegistroDose,
    selectAllRegistroDose,
    selectByIdRegistroDose,
    deleteRegistroDose,
    selectByIdHorario,
    marcarDoseComoTomada
}