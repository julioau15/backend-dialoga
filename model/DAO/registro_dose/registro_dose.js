/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela registroDose
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de registroDose
const insertRegistroDose = async (registroDose) => {
    let sql = `INSERT INTO tbl_registroDose (nome)
               VALUES ('${registroDose.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de registroDose
const updateRegistroDose = async (registroDose) => {
    let sql = `UPDATE tbl_registroDose
               SET nome = '${registroDose.nome}'
               WHERE id = ${registroDose.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas registroDoses
const selectAllRegistroDose = async () => {
    let sql = `SELECT * FROM tbl_registroDose ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma registroDose pelo id
const selectByIdRegistroDose = async (id) => {
    let sql = `SELECT * FROM tbl_registroDose
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de registroDose
const deleteRegistroDose = async (id) => {
    let sql = `DELETE FROM tbl_registroDose
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertRegistroDose,
    updateRegistroDose,
    selectAllRegistroDose,
    selectByIdRegistroDose,
    deleteRegistroDose
}