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
    let sql = `INSERT INTO tbl_resposta (nome)
               VALUES ('${resposta.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de resposta
const updateResposta = async (resposta) => {
    let sql = `UPDATE tbl_resposta
               SET nome = '${resposta.nome}'
               WHERE id = ${resposta.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas respostas
const selectAllResposta = async () => {
    let sql = `SELECT * FROM tbl_resposta ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma resposta pelo id
const selectByIdResposta = async (id) => {
    let sql = `SELECT * FROM tbl_resposta
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de resposta
const deleteResposta = async (id) => {
    let sql = `DELETE FROM tbl_resposta
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


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