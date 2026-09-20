/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela profissionalEspecialidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de profissionalEspecialidade
const insertProfissionalEspecialidade = async (profissionalEspecialidade) => {
    let sql = `INSERT INTO tbl_profissional_especialidade (id_profissional, id_especialidade)
               VALUES (?, ?)`

    try {
        let response = await knexConex.raw(sql, [profissionalEspecialidade.id_profissional, profissionalEspecialidade.id_especialidade])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de profissionalEspecialidade
const updateProfissionalEspecialidade = async (profissionalEspecialidade) => {
    let sql = `UPDATE tbl_profissional_especialidade
               SET id_profissional = ?,
                   id_especialidade = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [profissionalEspecialidade.id_profissional, profissionalEspecialidade.id_especialidade, profissionalEspecialidade.id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas profissionalEspecialidades
const selectAllProfissionalEspecialidade = async () => {
    let sql = `SELECT
                   id,
                   id_profissional,
                   id_especialidade
               FROM tbl_profissional_especialidade
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma profissionalEspecialidade pelo id
const selectByIdProfissionalEspecialidade = async (id) => {
    let sql = `SELECT
                   id,
                   id_profissional,
                   id_especialidade
               FROM tbl_profissional_especialidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de profissionalEspecialidade
const deleteProfissionalEspecialidade = async (id) => {
    let sql = `DELETE FROM tbl_profissional_especialidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertProfissionalEspecialidade,
    updateProfissionalEspecialidade,
    selectAllProfissionalEspecialidade,
    selectByIdProfissionalEspecialidade,
    deleteProfissionalEspecialidade
}