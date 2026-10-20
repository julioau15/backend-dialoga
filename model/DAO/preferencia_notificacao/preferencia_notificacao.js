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
    let sql = `INSERT INTO tbl_preferencia_notificacao (categoria, tipo_especifico, ativo, id_profissional, id_paciente)
               VALUES (?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            preferenciaNotificacao.categoria,
            preferenciaNotificacao.tipo_especifico,
            preferenciaNotificacao.ativo,
            preferenciaNotificacao.id_profissional,
            preferenciaNotificacao.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de preferenciaNotificacao
const updatePreferenciaNotificacao = async (preferenciaNotificacao) => {
    let sql = `UPDATE tbl_preferencia_notificacao
               SET categoria = ?,
                   tipo_especifico = ?,
                   ativo = ?,
                   id_profissional = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            preferenciaNotificacao.categoria,
            preferenciaNotificacao.tipo_especifico,
            preferenciaNotificacao.ativo,
            preferenciaNotificacao.id_profissional,
            preferenciaNotificacao.id_paciente,
            preferenciaNotificacao.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas preferenciaNotificacaos
const selectAllPreferenciaNotificacao = async () => {
    let sql = `SELECT
                   id,
                   categoria,
                   tipo_especifico,
                   ativo,
                   id_profissional,
                   id_paciente
               FROM tbl_preferencia_notificacao
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma preferenciaNotificacao pelo id
const selectByIdPreferenciaNotificacao = async (id) => {
    let sql = `SELECT
                   id,
                   categoria,
                   tipo_especifico,
                   ativo,
                   id_profissional,
                   id_paciente
               FROM tbl_preferencia_notificacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de preferenciaNotificacao
const deletePreferenciaNotificacao = async (id) => {
    let sql = `DELETE FROM tbl_preferencia_notificacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// lista as preferencias de um profissional
const selectPreferenciasProfissional = async (idProfissional) => {
    let sql = `SELECT
                   id,
                   categoria,
                   tipo_especifico,
                   ativo,
                   id_profissional
               FROM tbl_preferencia_notificacao
               WHERE id_profissional = ?`
    try {
        let response = await knexConex.raw(sql, [idProfissional])

        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// lista as preferencias de um paciente
const selectPreferenciasPaciente = async (idPaciente) => {
    let sql = `SELECT
                   id,
                   categoria,
                   tipo_especifico,
                   ativo,
                   id_paciente
               FROM tbl_preferencia_notificacao
               WHERE id_paciente = ?`
    try {
        let response = await knexConex.raw(sql, [idPaciente])

        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// insere uma preferencia de notificacao de um profissional
const insertPreferenciaNotificacaoProfissional = async (preferenciaNotificacao) => {
    let sql = `INSERT INTO tbl_preferencia_notificacao (categoria, tipo_especifico, ativo, id_profissional)
               VALUES (?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            preferenciaNotificacao.categoria,
            preferenciaNotificacao.tipo_especifico,
            preferenciaNotificacao.ativo,
            preferenciaNotificacao.id_profissional
        ])

        if(response) return response[0].insertId

    } catch (error) { console.log(error) }

    return false
}

// insere uma preferencia de notificacao de um paciente
const insertPreferenciaNotificacaoPaciente = async (preferenciaNotificacao) => {
    let sql = `INSERT INTO tbl_preferencia_notificacao (categoria, tipo_especifico, ativo, id_paciente)
               VALUES (?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            preferenciaNotificacao.categoria,
            preferenciaNotificacao.tipo_especifico,
            preferenciaNotificacao.ativo,
            preferenciaNotificacao.id_paciente
        ])

        if(response) return response[0].insertId

    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertPreferenciaNotificacao,
    updatePreferenciaNotificacao,
    selectAllPreferenciaNotificacao,
    selectByIdPreferenciaNotificacao,
    deletePreferenciaNotificacao,
    selectPreferenciasProfissional,
    selectPreferenciasPaciente,
    insertPreferenciaNotificacaoProfissional,
    insertPreferenciaNotificacaoPaciente
}