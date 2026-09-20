/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela pergunta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de pergunta
const insertPergunta = async (pergunta) => {
    let sql = `INSERT INTO tbl_pergunta (tipo, texto, imagem, obrigatoria, ordem, id_tarefa)
               VALUES (?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            pergunta.tipo,
            pergunta.texto,
            pergunta.imagem,
            pergunta.obrigatoria,
            pergunta.ordem,
            pergunta.id_tarefa
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de pergunta
const updatePergunta = async (pergunta) => {
    let sql = `UPDATE tbl_pergunta
               SET tipo = ?,
                   texto = ?,
                   imagem = ?,
                   obrigatoria = ?,
                   ordem = ?,
                   id_tarefa = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            pergunta.tipo,
            pergunta.texto,
            pergunta.imagem,
            pergunta.obrigatoria,
            pergunta.ordem,
            pergunta.id_tarefa,
            pergunta.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas perguntas
const selectAllPergunta = async () => {
    let sql = `SELECT
                   id,
                   tipo,
                   texto,
                   imagem,
                   obrigatoria,
                   ordem,
                   id_tarefa
               FROM tbl_pergunta
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma pergunta pelo id
const selectByIdPergunta = async (id) => {
    let sql = `SELECT
                   id,
                   tipo,
                   texto,
                   imagem,
                   obrigatoria,
                   ordem,
                   id_tarefa
               FROM tbl_pergunta
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de pergunta
const deletePergunta = async (id) => {
    let sql = `DELETE FROM tbl_pergunta
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertPergunta,
    updatePergunta,
    selectAllPergunta,
    selectByIdPergunta,
    deletePergunta
}