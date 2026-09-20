/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela profissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de profissional
const insertProfissional = async (profissional) => {
    let sql = `INSERT INTO tbl_profissional (nome)
               VALUES ('${profissional.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de profissional
const updateProfissional = async (profissional) => {
    let sql = `UPDATE tbl_profissional
               SET nome = '${profissional.nome}'
               WHERE id = ${profissional.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas profissionals
const selectAllProfissional = async () => {
    let sql = `SELECT * FROM tbl_profissional ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma profissional pelo id
const selectByIdProfissional = async (id) => {
    let sql = `SELECT * FROM tbl_profissional
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de profissional
const deleteProfissional = async (id) => {
    let sql = `DELETE FROM tbl_profissional
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertProfissional,
    updateProfissional,
    selectAllProfissional,
    selectByIdProfissional,
    deleteProfissional
}