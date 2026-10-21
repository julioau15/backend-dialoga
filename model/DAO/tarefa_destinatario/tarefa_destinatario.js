/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela tarefaDestinatario
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de tarefaDestinatario
const insertTarefaDestinatario = async (tarefaDestinatario) => {
    let sql = `INSERT INTO tbl_tarefa_destinatario (prazo, status, data_conclusao, id_tarefa, id_paciente)
               VALUES (?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            tarefaDestinatario.prazo,
            0, // status
            null, // data de conclusao
            tarefaDestinatario.id_tarefa,
            tarefaDestinatario.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de tarefaDestinatario
const updateTarefaDestinatario = async (tarefaDestinatario) => {
    let sql = `UPDATE tbl_tarefa_destinatario
               SET prazo = ?,
                   status = ?,
                   data_conclusao = ?,
                   id_tarefa = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            tarefaDestinatario.prazo,
            tarefaDestinatario.status,
            tarefaDestinatario.data_conclusao,
            tarefaDestinatario.id_tarefa,
            tarefaDestinatario.id_paciente,
            tarefaDestinatario.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas tarefaDestinatarios
const selectAllTarefaDestinatario = async () => {
    let sql = `SELECT
                   id,
                   prazo,
                   status,
                   data_conclusao,
                   id_tarefa,
                   id_paciente
               FROM tbl_tarefa_destinatario
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma tarefaDestinatario pelo id
const selectByIdTarefaDestinatario = async (id) => {
    let sql = `SELECT
                   id,
                   prazo,
                   status,
                   data_conclusao,
                   id_tarefa,
                   id_paciente
               FROM tbl_tarefa_destinatario
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de tarefaDestinatario
const deleteTarefaDestinatario = async (id) => {
    let sql = `DELETE FROM tbl_tarefa_destinatario
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// listar tarefaDestinatario pelo id da tarefa, nome do paciente, status da tarefa e periodo 
const filtrarTarefasDestinatario = async (filtro = {}) => {
    let sql = `
        SELECT
            tbl_tarefa_destinatario.id,
            tbl_tarefa_destinatario.prazo,
            tbl_tarefa_destinatario.status,
            tbl_tarefa_destinatario.data_conclusao,
            tbl_tarefa_destinatario.id_tarefa,
            tbl_tarefa_destinatario.id_paciente,
            tbl_paciente.nome_completo AS nome_paciente,
            tbl_tarefa.titulo AS nome_tarefa
        FROM tbl_tarefa_destinatario
        INNER JOIN tbl_paciente
            ON tbl_paciente.id = tbl_tarefa_destinatario.id_paciente
        INNER JOIN tbl_tarefa
            ON tbl_tarefa.id = tbl_tarefa_destinatario.id_tarefa
        WHERE 1 = 1
    `
    const params = []

    if (filtro.id_tarefa !== undefined && filtro.id_tarefa !== null && filtro.id_tarefa !== '') {
        sql += ` AND tbl_tarefa_destinatario.id_tarefa = ?`
        params.push(filtro.id_tarefa)
    }

    if (filtro.nome_paciente) {
        sql += ` AND tbl_paciente.nome LIKE ?`
        params.push(`%${filtro.nome_paciente}%`)
    }

    if (filtro.status) {
        sql += ` AND tbl_tarefa_destinatario.status = ?`
        params.push(filtro.status)
    }

    if (filtro.data_inicial && filtro.data_final) {
        sql += ` AND tbl_tarefa_destinatario.prazo BETWEEN ? AND ?`
        params.push(filtro.data_inicial, filtro.data_final)
    } else if (filtro.periodo) {
        const periodo = String(filtro.periodo).toUpperCase()

        if (periodo === 'HOJE') {
            sql += ` AND DATE(tbl_tarefa_destinatario.prazo) = CURDATE()`
        } else if (periodo === 'SEMANA') {
            sql += ` AND YEARWEEK(tbl_tarefa_destinatario.prazo, 1) = YEARWEEK(CURDATE(), 1)`
        } else if (periodo === 'MES') {
            sql += ` AND DATE_FORMAT(tbl_tarefa_destinatario.prazo, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
        }
    }

    sql += ` ORDER BY tbl_tarefa_destinatario.id DESC`

    try {
        const response = await knexConex.raw(sql, params)

        if (response) return response[0]
    } catch (error) {
        console.log(error)
    }

    return false
}

module.exports = {
    insertTarefaDestinatario,
    updateTarefaDestinatario,
    selectAllTarefaDestinatario,
    selectByIdTarefaDestinatario,
    deleteTarefaDestinatario,
    filtrarTarefasDestinatario
}