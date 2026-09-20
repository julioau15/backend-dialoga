/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela solicitacaoAcesso
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de solicitacaoAcesso
const insertSolicitacaoAcesso = async (solicitacaoAcesso) => {
    let sql = `INSERT INTO tbl_solicitacao_acesso (status, data_solicitacao, data_resposta, id_profissional, id_paciente)
               VALUES (?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            solicitacaoAcesso.status,
            solicitacaoAcesso.data_solicitacao,
            solicitacaoAcesso.data_resposta,
            solicitacaoAcesso.id_profissional,
            solicitacaoAcesso.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de solicitacaoAcesso
const updateSolicitacaoAcesso = async (solicitacaoAcesso) => {
    let sql = `UPDATE tbl_solicitacao_acesso
               SET status = ?,
                   data_solicitacao = ?,
                   data_resposta = ?,
                   id_profissional = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            solicitacaoAcesso.status,
            solicitacaoAcesso.data_solicitacao,
            solicitacaoAcesso.data_resposta,
            solicitacaoAcesso.id_profissional,
            solicitacaoAcesso.id_paciente,
            solicitacaoAcesso.id
        ])

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas solicitacaoAcessos
const selectAllSolicitacaoAcesso = async () => {
    let sql = `SELECT
                   id,
                   status,
                   data_solicitacao,
                   data_resposta,
                   id_profissional,
                   id_paciente
               FROM tbl_solicitacao_acesso
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma solicitacaoAcesso pelo id
const selectByIdSolicitacaoAcesso = async (id) => {
    let sql = `SELECT
                   id,
                   status,
                   data_solicitacao,
                   data_resposta,
                   id_profissional,
                   id_paciente
               FROM tbl_solicitacao_acesso
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de solicitacaoAcesso
const deleteSolicitacaoAcesso = async (id) => {
    let sql = `DELETE FROM tbl_solicitacao_acesso
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertSolicitacaoAcesso,
    updateSolicitacaoAcesso,
    selectAllSolicitacaoAcesso,
    selectByIdSolicitacaoAcesso,
    deleteSolicitacaoAcesso
}