/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela horarioTratamento
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de horarioTratamento
const insertHorarioTratamento = async (horarioTratamento, idTratamento) => {
    let sql = `INSERT INTO tbl_horario_tratamento (horario, id_tratamento)
               VALUES (?, ?)`

    try {
        let response = await knexConex.raw(sql, [horarioTratamento.horario, idTratamento])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de horarioTratamento
const updateHorarioTratamento = async (horarioTratamento) => {
    let sql = `UPDATE tbl_horario_tratamento
               SET horario = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [horarioTratamento.horario, horarioTratamento.id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas horarioTratamentos
const selectAllHorarioTratamento = async () => {
    let sql = `SELECT
                   id,
                   horario,
                   id_tratamento
               FROM tbl_horario_tratamento
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma horarioTratamento pelo id
const selectByIdHorarioTratamento = async (id) => {
    let sql = `SELECT
                   id,
                   horario,
                   id_tratamento
               FROM tbl_horario_tratamento
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de horarioTratamento
const deleteHorarioTratamento = async (id) => {
    let sql = `DELETE FROM tbl_horario_tratamento
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// delete de horarioTratamento pelo id do tratamento
const deleteHorarioTratamentoByIdTratamento = async (idTratamento) => {
    let sql = `DELETE FROM tbl_horario_tratamento
               WHERE id_tratamento = ?`
    try {
        let response = await knexConex.raw(sql, [idTratamento])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// select de todas horarioTratamentos pelo id da tratamento
const selectAllHorarioTratamentoByIdTratamento = async (idTratamento) => {
    let sql = `SELECT
                   id,
                   horario,
                   id_tratamento
               FROM tbl_horario_tratamento
               WHERE id_tratamento = ?
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql, [idTratamento])


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertHorarioTratamento,
    updateHorarioTratamento,
    selectAllHorarioTratamento,
    selectByIdHorarioTratamento,
    deleteHorarioTratamento,
    selectAllHorarioTratamentoByIdTratamento,
    deleteHorarioTratamentoByIdTratamento
}