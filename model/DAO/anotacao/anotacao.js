/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela anotacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de anotacao
const insertAnotacao = async (anotacao) => {
    let sql = `INSERT INTO tbl_anotacao (titulo, conteudo, data_criacao, data_edicao, id_profissional, id_paciente)
               VALUES (?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            anotacao.titulo,
            anotacao.conteudo,
            anotacao.data_criacao,
            anotacao.data_edicao,
            anotacao.id_profissional,
            anotacao.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de anotacao
const updateAnotacao = async (anotacao) => {
    let sql = `UPDATE tbl_anotacao
               SET titulo = ?,
                   conteudo = ?,
                   data_criacao = ?,
                   data_edicao = ?,
                   id_profissional = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            anotacao.titulo,
            anotacao.conteudo,
            anotacao.data_criacao,
            anotacao.data_edicao,
            anotacao.id_profissional,
            anotacao.id_paciente,
            anotacao.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas anotacaos
const selectAllAnotacao = async () => {
    let sql = `SELECT
                   id,
                   titulo,
                   conteudo,
                   data_criacao,
                   data_edicao,
                   id_profissional,
                   id_paciente
               FROM tbl_anotacao
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma anotacao pelo id
const selectByIdAnotacao = async (id) => {
    let sql = `SELECT
                   id,
                   titulo,
                   conteudo,
                   data_criacao,
                   data_edicao,
                   id_profissional,
                   id_paciente
               FROM tbl_anotacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de anotacao
const deleteAnotacao = async (id) => {
    let sql = `DELETE FROM tbl_anotacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertAnotacao,
    updateAnotacao,
    selectAllAnotacao,
    selectByIdAnotacao,
    deleteAnotacao
}