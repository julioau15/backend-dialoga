/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela tratamento
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de tratamento
const insertTratamento = async (tratamento) => {
    let sql = `INSERT INTO tbl_tratamento (nome_medicamento, dosagem, frequencia, lembrete_ativo, id_paciente)
               VALUES (?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            tratamento.nome_medicamento,
            tratamento.dosagem,
            tratamento.frequencia,
            tratamento.lembrete_ativo,
            tratamento.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de tratamento
const updateTratamento = async (tratamento) => {
    let sql = `UPDATE tbl_tratamento
               SET nome_medicamento = ?,
                   dosagem = ?,
                   frequencia = ?,
                   lembrete_ativo = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            tratamento.nome_medicamento,
            tratamento.dosagem,
            tratamento.frequencia,
            tratamento.lembrete_ativo,
            tratamento.id_paciente,
            tratamento.id
        ])

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas tratamentos
const selectAllTratamento = async () => {
    let sql = `SELECT
                   id,
                   nome_medicamento,
                   dosagem,
                   frequencia,
                   lembrete_ativo,
                   id_paciente
               FROM tbl_tratamento
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma tratamento pelo id
const selectByIdTratamento = async (id) => {
    let sql = `SELECT
                   id,
                   nome_medicamento,
                   dosagem,
                   frequencia,
                   lembrete_ativo,
                   id_paciente
               FROM tbl_tratamento
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de tratamento
const deleteTratamento = async (id) => {
    let sql = `DELETE FROM tbl_tratamento
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertTratamento,
    updateTratamento,
    selectAllTratamento,
    selectByIdTratamento,
    deleteTratamento
}