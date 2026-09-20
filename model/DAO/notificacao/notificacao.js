/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela notificacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de notificacao
const insertNotificacao = async (notificacao) => {
    let sql = `INSERT INTO tbl_notificacao (nome)
               VALUES ('${notificacao.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de notificacao
const updateNotificacao = async (notificacao) => {
    let sql = `UPDATE tbl_notificacao
               SET nome = '${notificacao.nome}'
               WHERE id = ${notificacao.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas notificacaos
const selectAllNotificacao = async () => {
    let sql = `SELECT * FROM tbl_notificacao ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma notificacao pelo id
const selectByIdNotificacao = async (id) => {
    let sql = `SELECT * FROM tbl_notificacao
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de notificacao
const deleteNotificacao = async (id) => {
    let sql = `DELETE FROM tbl_notificacao
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertNotificacao,
    updateNotificacao,
    selectAllNotificacao,
    selectByIdNotificacao,
    deleteNotificacao
}