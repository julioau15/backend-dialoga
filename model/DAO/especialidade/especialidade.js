/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela especialidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de especialidade
const insertEspecialidade = async (especialidade) => {
    let sql = `INSERT INTO tbl_especialidade (especialidade)
               VALUES (?)`

    try {
        let response = await knexConex.raw(sql, [especialidade.especialidade])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de especialidade
const updateEspecialidade = async (especialidade) => {
    let sql = `UPDATE tbl_especialidade
               SET especialidade = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [especialidade.especialidade, especialidade.id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas especialidades
const selectAllEspecialidade = async () => {
    let sql = `SELECT
                   id,
                   especialidade
               FROM tbl_especialidade
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma especialidade pelo id
const selectByIdEspecialidade = async (id) => {
    let sql = `SELECT
                   id,
                   especialidade
               FROM tbl_especialidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de especialidade
const deleteEspecialidade = async (id) => {
    let sql = `DELETE FROM tbl_especialidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertEspecialidade,
    updateEspecialidade,
    selectAllEspecialidade,
    selectByIdEspecialidade,
    deleteEspecialidade
}