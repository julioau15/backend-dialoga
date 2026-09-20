/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela registroHumor
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de registroHumor
const insertRegistroHumor = async (registroHumor) => {
    let sql = `INSERT INTO tbl_registro_humor (nome)
               VALUES ('${registroHumor.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de registroHumor
const updateRegistroHumor = async (registroHumor) => {
    let sql = `UPDATE tbl_registro_humor
               SET nome = '${registroHumor.nome}'
               WHERE id = ${registroHumor.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas registroHumors
const selectAllRegistroHumor = async () => {
    let sql = `SELECT * FROM tbl_registro_humor ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma registroHumor pelo id
const selectByIdRegistroHumor = async (id) => {
    let sql = `SELECT * FROM tbl_registro_humor
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de registroHumor
const deleteRegistroHumor = async (id) => {
    let sql = `DELETE FROM tbl_registro_humor
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertRegistroHumor,
    updateRegistroHumor,
    selectAllRegistroHumor,
    selectByIdRegistroHumor,
    deleteRegistroHumor
}