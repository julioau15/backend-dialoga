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
const insertHorarioTratamento = async (horarioTratamento) => {
    let sql = `INSERT INTO tbl_horario_tratamento (nome)
               VALUES ('${horarioTratamento.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de horarioTratamento
const updateHorarioTratamento = async (horarioTratamento) => {
    let sql = `UPDATE tbl_horario_tratamento
               SET nome = '${horarioTratamento.nome}'
               WHERE id = ${horarioTratamento.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas horarioTratamentos
const selectAllHorarioTratamento = async () => {
    let sql = `SELECT * FROM tbl_horario_tratamento ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma horarioTratamento pelo id
const selectByIdHorarioTratamento = async (id) => {
    let sql = `SELECT * FROM tbl_horario_tratamento
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de horarioTratamento
const deleteHorarioTratamento = async (id) => {
    let sql = `DELETE FROM tbl_horario_tratamento
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertHorarioTratamento,
    updateHorarioTratamento,
    selectAllHorarioTratamento,
    selectByIdHorarioTratamento,
    deleteHorarioTratamento
}