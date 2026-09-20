/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela registroHumor
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de registroHumor
const insertRegistroHumor = async (registroHumor) => {
    let sql = `INSERT INTO tbl_registro_humor (data, sentimento, energia, humor, padrao_pensamentos, horas_sono, relato, data_criacao, id_paciente)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [registroHumor.data, registroHumor.sentimento, registroHumor.energia, registroHumor.humor, registroHumor.padrao_pensamentos, registroHumor.horas_sono, registroHumor.relato, registroHumor.data_criacao, registroHumor.id_paciente])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de registroHumor
const updateRegistroHumor = async (registroHumor) => {
    let sql = `UPDATE tbl_registro_humor
               SET data = ?,
                   sentimento = ?,
                   energia = ?,
                   humor = ?,
                   padrao_pensamentos = ?,
                   horas_sono = ?,
                   relato = ?,
                   data_criacao = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [registroHumor.data, registroHumor.sentimento, registroHumor.energia, registroHumor.humor, registroHumor.padrao_pensamentos, registroHumor.horas_sono, registroHumor.relato, registroHumor.data_criacao, registroHumor.id_paciente, registroHumor.id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas registroHumors
const selectAllRegistroHumor = async () => {
    let sql = `SELECT
                   id,
                   data,
                   sentimento,
                   energia,
                   humor,
                   padrao_pensamentos,
                   horas_sono,
                   relato,
                   data_criacao,
                   id_paciente
               FROM tbl_registro_humor
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma registroHumor pelo id
const selectByIdRegistroHumor = async (id) => {
    let sql = `SELECT
                   id,
                   data,
                   sentimento,
                   energia,
                   humor,
                   padrao_pensamentos,
                   horas_sono,
                   relato,
                   data_criacao,
                   id_paciente
               FROM tbl_registro_humor
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de registroHumor
const deleteRegistroHumor = async (id) => {
    let sql = `DELETE FROM tbl_registro_humor
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertRegistroHumor,
    updateRegistroHumor,
    selectAllRegistroHumor,
    selectByIdRegistroHumor,
    deleteRegistroHumor
}