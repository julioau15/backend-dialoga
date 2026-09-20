/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela adminstrador
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de adminstrador
const insertAdminstrador = async (adminstrador) => {
    let sql = `INSERT INTO tbl_adminstrador (nome)
               VALUES ('${adminstrador.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de adminstrador
const updateAdminstrador = async (adminstrador) => {
    let sql = `UPDATE tbl_adminstrador
               SET nome = '${adminstrador.nome}'
               WHERE id = ${adminstrador.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas adminstradors
const selectAllAdminstrador = async () => {
    let sql = `SELECT * FROM tbl_adminstrador ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma adminstrador pelo id
const selectByIdAdminstrador = async (id) => {
    let sql = `SELECT * FROM tbl_adminstrador
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de adminstrador
const deleteAdminstrador = async (id) => {
    let sql = `DELETE FROM tbl_adminstrador
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertAdminstrador,
    updateAdminstrador,
    selectAllAdminstrador,
    selectByIdAdminstrador,
    deleteAdminstrador
}