/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela preferenciaNotificacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de preferenciaNotificacao
const insertPreferenciaNotificacao = async (preferenciaNotificacao) => {
    let sql = `INSERT INTO tbl_preferenciaNotificacao (nome)
               VALUES ('${preferenciaNotificacao.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de preferenciaNotificacao
const updatePreferenciaNotificacao = async (preferenciaNotificacao) => {
    let sql = `UPDATE tbl_preferenciaNotificacao
               SET nome = '${preferenciaNotificacao.nome}'
               WHERE id = ${preferenciaNotificacao.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas preferenciaNotificacaos
const selectAllPreferenciaNotificacao = async () => {
    let sql = `SELECT * FROM tbl_preferenciaNotificacao ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma preferenciaNotificacao pelo id
const selectByIdPreferenciaNotificacao = async (id) => {
    let sql = `SELECT * FROM tbl_preferenciaNotificacao
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de preferenciaNotificacao
const deletePreferenciaNotificacao = async (id) => {
    let sql = `DELETE FROM tbl_preferenciaNotificacao
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertPreferenciaNotificacao,
    updatePreferenciaNotificacao,
    selectAllPreferenciaNotificacao,
    selectByIdPreferenciaNotificacao,
    deletePreferenciaNotificacao
}