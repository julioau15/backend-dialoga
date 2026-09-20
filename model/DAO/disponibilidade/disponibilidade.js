/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela disponibilidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de disponibilidade
const insertDisponibilidade = async (disponibilidade) => {
    let sql = `INSERT INTO tbl_disponibilidade (dias_da_semana, hora_inicio, hora_fim, tipo_repeticao, data_inicial, data_final, id_profissional)
               VALUES (?, ?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            disponibilidade.dias_da_semana,
            disponibilidade.hora_inicio,
            disponibilidade.hora_fim,
            disponibilidade.tipo_repeticao,
            disponibilidade.data_inicial,
            disponibilidade.data_final,
            disponibilidade.id_profissional
        ])

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de disponibilidade
const updateDisponibilidade = async (disponibilidade) => {
    let sql = `UPDATE tbl_disponibilidade
               SET dias_da_semana = ?,
                   hora_inicio = ?,
                   hora_fim = ?,
                   tipo_repeticao = ?,
                   data_inicial = ?,
                   data_final = ?,
                   id_profissional = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            disponibilidade.dias_da_semana,
            disponibilidade.hora_inicio,
            disponibilidade.hora_fim,
            disponibilidade.tipo_repeticao,
            disponibilidade.data_inicial,
            disponibilidade.data_final,
            disponibilidade.id_profissional,
            disponibilidade.id
        ])

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas disponibilidades
const selectAllDisponibilidade = async () => {
    let sql = `SELECT
                   id,
                   dias_da_semana,
                   hora_inicio,
                   hora_fim,
                   tipo_repeticao,
                   data_inicial,
                   data_final,
                   id_profissional
               FROM tbl_disponibilidade
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma disponibilidade pelo id
const selectByIdDisponibilidade = async (id) => {
    let sql = `SELECT
                   id,
                   dias_da_semana,
                   hora_inicio,
                   hora_fim,
                   tipo_repeticao,
                   data_inicial,
                   data_final,
                   id_profissional
               FROM tbl_disponibilidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de disponibilidade
const deleteDisponibilidade = async (id) => {
    let sql = `DELETE FROM tbl_disponibilidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertDisponibilidade,
    updateDisponibilidade,
    selectAllDisponibilidade,
    selectByIdDisponibilidade,
    deleteDisponibilidade
}