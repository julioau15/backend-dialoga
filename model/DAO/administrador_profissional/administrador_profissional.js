/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela administradorProfissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de administradorProfissional
const insertAdministradorProfissional = async (administradorProfissional) => {
    let sql = `INSERT INTO tbl_administradorProfissional (nome)
               VALUES ('${administradorProfissional.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de administradorProfissional
const updateAdministradorProfissional = async (administradorProfissional) => {
    let sql = `UPDATE tbl_administradorProfissional
               SET nome = '${administradorProfissional.nome}'
               WHERE id = ${administradorProfissional.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas administradorProfissionals
const selectAllAdministradorProfissional = async () => {
    let sql = `SELECT * FROM tbl_administradorProfissional ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma administradorProfissional pelo id
const selectByIdAdministradorProfissional = async (id) => {
    let sql = `SELECT * FROM tbl_administradorProfissional
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de administradorProfissional
const deleteAdministradorProfissional = async (id) => {
    let sql = `DELETE FROM tbl_administradorProfissional
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertAdministradorProfissional,
    updateAdministradorProfissional,
    selectAllAdministradorProfissional,
    selectByIdAdministradorProfissional,
    deleteAdministradorProfissional
}