/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela diasDaSemana
 * Data: 26/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de diasDaSemana
const insertDiasDaSemana = async (diasDaSemana) => {
    let sql = `INSERT INTO tbl_dias_da_semana (dias_da_semana)
               VALUES (?)`

    try {
        let response = await knexConex.raw(sql, [
            diasDaSemana.dias_da_semana
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de diasDaSemana
const updateDiasDaSemana = async (diasDaSemana) => {
    let sql = `UPDATE tbl_dias_da_semana
               SET
                   dias_da_semana = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            diasDaSemana.dias_da_semana,
            diasDaSemana.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas diasDaSemanas
const selectAllDiasDaSemana = async () => {
    let sql = `SELECT
                   id,
                   dias_da_semana
               FROM tbl_dias_da_semana
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma diasDaSemana pelo id
const selectByIdDiasDaSemana = async (id) => {
    let sql = `SELECT
                   id,
                   dias_da_semana
               FROM tbl_dias_da_semana
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de diasDaSemana
const deleteDiasDaSemana = async (id) => {
    let sql = `DELETE FROM tbl_dias_da_semana
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertDiasDaSemana,
    updateDiasDaSemana,
    selectAllDiasDaSemana,
    selectByIdDiasDaSemana,
    deleteDiasDaSemana
}