/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela paciente
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de paciente
const insertPaciente = async (paciente) => {
    let sql = `INSERT INTO tbl_paciente (nome)
               VALUES ('${paciente.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de paciente
const updatePaciente = async (paciente) => {
    let sql = `UPDATE tbl_paciente
               SET nome = '${paciente.nome}'
               WHERE id = ${paciente.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas pacientes
const selectAllPaciente = async () => {
    let sql = `SELECT * FROM tbl_paciente ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma paciente pelo id
const selectByIdPaciente = async (id) => {
    let sql = `SELECT * FROM tbl_paciente
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de paciente
const deletePaciente = async (id) => {
    let sql = `DELETE FROM tbl_paciente
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertPaciente,
    updatePaciente,
    selectAllPaciente,
    selectByIdPaciente,
    deletePaciente
}