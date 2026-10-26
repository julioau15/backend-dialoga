/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela diasDaSemanaDisponibilidade
 * Data: 26/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de diasDaSemanaDisponibilidade
const insertDiasDaSemanaDisponibilidade = async (diasDaSemanaDisponibilidade) => {
    let sql = `INSERT INTO tbl_dias_da_semana_disponibilidade (id_dias_da_semana, id_disponibilidade)
               VALUES (?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            diasDaSemanaDisponibilidade.id_dias_da_semana,
            diasDaSemanaDisponibilidade.id_disponibilidade
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// select de todas diasDaSemanaDisponibilidades
const selectAllDiasDaSemanaDisponibilidade = async () => {
    let sql =   `SELECT
                    id
                    id_dias_da_semana,
                    id_disponibilidade
                FROM tbl_dias_da_semana_disponibilidade
                ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma diasDaSemanaDisponibilidade pelo id
const selectByIdDiasDaSemanaDisponibilidade = async (id) => {
    let sql = `SELECT
                    id
                    id_dias_da_semana,
                    id_disponibilidade
                FROM tbl_dias_da_semana_disponibilidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de diasDaSemanaDisponibilidade
const deleteDiasDaSemanaDisponibilidade = async (id) => {
    let sql = `DELETE FROM tbl_dias_da_semana_disponibilidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// buscar dias da semana pelo id da disponibilidade
const selectDiasDaSemanaByIdDisponibilidade = async (idDisponibilidade) => {
    let sql =   `SELECT
                    tbl_dias_da_semana.id,
                    tbl_dias_da_semana.dias_da_semana
                FROM tbl_dias_da_semana
                INNER JOIN tbl_dias_da_semana_disponibilidade
                    ON tbl_dias_da_semana.id = tbl_dias_da_semana_disponibilidade.id_dias_da_semana
                WHERE tbl_dias_da_semana_disponibilidade.id_disponibilidade = ?
                ORDER BY tbl_dias_da_semana.id DESC`
    try {
        let response = await knexConex.raw(sql, [idDisponibilidade])

        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// excluir dias da semana pelo id da disponibilidade
const deleteDiasDaSemanaDisponibilidadeByIdDisponibilidade = async (idDisponibilidade) => {
    let sql = `DELETE FROM tbl_dias_da_semana_disponibilidade
               WHERE id_disponibilidade = ?`

    try {
        let response = await knexConex.raw(sql, [idDisponibilidade])

        if (response) return response[0]

    } catch (error) {
        console.log(error)
    }

    return false
}

module.exports = {
    insertDiasDaSemanaDisponibilidade,
    selectAllDiasDaSemanaDisponibilidade,
    selectByIdDiasDaSemanaDisponibilidade,
    deleteDiasDaSemanaDisponibilidade,
    selectDiasDaSemanaByIdDisponibilidade,
    deleteDiasDaSemanaDisponibilidadeByIdDisponibilidade
}