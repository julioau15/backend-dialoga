/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela resposta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de resposta
const insertResposta = async (resposta) => {
    let sql = `INSERT INTO tbl_resposta (valor, data_envio, id_pergunta, id_opcao_pergunta, id_tarefa_destinatario)
               VALUES (?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [resposta.valor, resposta.data_envio, resposta.id_pergunta, resposta.id_opcao_pergunta, resposta.id_tarefa_destinatario])

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de resposta
const updateResposta = async (resposta) => {
    let sql = `UPDATE tbl_resposta
               SET valor = ?,
                   data_envio = ?,
                   id_pergunta = ?,
                   id_opcao_pergunta = ?,
                   id_tarefa_destinatario = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [resposta.valor, resposta.data_envio, resposta.id_pergunta, resposta.id_opcao_pergunta, resposta.id_tarefa_destinatario, resposta.id])

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas respostas
const selectAllResposta = async () => {
    let sql = `SELECT
                   id,
                   valor,
                   data_envio,
                   id_pergunta,
                   id_opcao_pergunta,
                   id_tarefa_destinatario
               FROM tbl_resposta
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma resposta pelo id
const selectByIdResposta = async (id) => {
    let sql = `SELECT
                   id,
                   valor,
                   data_envio,
                   id_pergunta,
                   id_opcao_pergunta,
                   id_tarefa_destinatario
               FROM tbl_resposta
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de resposta
const deleteResposta = async (id) => {
    let sql = `DELETE FROM tbl_resposta
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertResposta,
    updateResposta,
    selectAllResposta,
    selectByIdResposta,
    deleteResposta
}