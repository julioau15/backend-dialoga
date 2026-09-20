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
            tarefaDestinatario.status,
            tarefaDestinatario.data_conclusao,
            tarefaDestinatario.id_tarefa,
            tarefaDestinatario.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) {}

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

    } catch (error) {}

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
 
    } catch (error) {}

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
        
    } catch (error) {}

    return false
}

// delete de tarefaDestinatario
const deleteTarefaDestinatario = async (id) => {
    let sql = `DELETE FROM tbl_tarefa_destinatario
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertTarefaDestinatario,
    updateTarefaDestinatario,
    selectAllTarefaDestinatario,
    selectByIdTarefaDestinatario,
    deleteTarefaDestinatario
}