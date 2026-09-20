/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela consulta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de consulta
const insertConsulta = async (consulta) => {
    let sql = `INSERT INTO tbl_consulta (nome)
               VALUES ('${consulta.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de consulta
const updateConsulta = async (consulta) => {
    let sql = `UPDATE tbl_consulta
               SET nome = '${consulta.nome}'
               WHERE id = ${consulta.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas consultas
const selectAllConsulta = async () => {
    let sql = `SELECT * FROM tbl_consulta ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma consulta pelo id
const selectByIdConsulta = async (id) => {
    let sql = `SELECT * FROM tbl_consulta
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de consulta
const deleteConsulta = async (id) => {
    let sql = `DELETE FROM tbl_consulta
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertConsulta,
    updateConsulta,
    selectAllConsulta,
    selectByIdConsulta,
    deleteConsulta
}