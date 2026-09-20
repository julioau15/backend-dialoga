/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela tarefa
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de tarefa
const insertTarefa = async (tarefa) => {
    let sql = `INSERT INTO tbl_tarefa (nome)
               VALUES ('${tarefa.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de tarefa
const updateTarefa = async (tarefa) => {
    let sql = `UPDATE tbl_tarefa
               SET nome = '${tarefa.nome}'
               WHERE id = ${tarefa.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas tarefas
const selectAllTarefa = async () => {
    let sql = `SELECT * FROM tbl_tarefa ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma tarefa pelo id
const selectByIdTarefa = async (id) => {
    let sql = `SELECT * FROM tbl_tarefa
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de tarefa
const deleteTarefa = async (id) => {
    let sql = `DELETE FROM tbl_tarefa
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertTarefa,
    updateTarefa,
    selectAllTarefa,
    selectByIdTarefa,
    deleteTarefa
}