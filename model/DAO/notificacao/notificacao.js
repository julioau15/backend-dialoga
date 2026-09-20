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
    let sql = `INSERT INTO tbl_notificacao (titulo_mensagem, lida, data_criacao, referencia_evento, id_categoria, id_profissional, id_paciente)
               VALUES (?, ?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [notificacao.titulo_mensagem, notificacao.lida, notificacao.data_criacao, notificacao.referencia_evento, notificacao.id_categoria, notificacao.id_profissional, notificacao.id_paciente])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de notificacao
const updateNotificacao = async (notificacao) => {
    let sql = `UPDATE tbl_notificacao
               SET titulo_mensagem = ?,
                   lida = ?,
                   data_criacao = ?,
                   referencia_evento = ?,
                   id_categoria = ?,
                   id_profissional = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [notificacao.titulo_mensagem, notificacao.lida, notificacao.data_criacao, notificacao.referencia_evento, notificacao.id_categoria, notificacao.id_profissional, notificacao.id_paciente, notificacao.id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas notificacaos
const selectAllNotificacao = async () => {
    let sql = `SELECT
                   id,
                   titulo_mensagem,
                   lida,
                   data_criacao,
                   referencia_evento,
                   id_categoria,
                   id_profissional,
                   id_paciente
               FROM tbl_notificacao
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma notificacao pelo id
const selectByIdNotificacao = async (id) => {
    let sql = `SELECT
                   id,
                   titulo_mensagem,
                   lida,
                   data_criacao,
                   referencia_evento,
                   id_categoria,
                   id_profissional,
                   id_paciente
               FROM tbl_notificacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de notificacao
const deleteNotificacao = async (id) => {
    let sql = `DELETE FROM tbl_notificacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertNotificacao,
    updateNotificacao,
    selectAllNotificacao,
    selectByIdNotificacao,
    deleteNotificacao
}