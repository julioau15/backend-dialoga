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
    let sql = `INSERT INTO tbl_profissionalEspecialidade (nome)
               VALUES ('${profissionalEspecialidade.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de profissionalEspecialidade
const updateProfissionalEspecialidade = async (profissionalEspecialidade) => {
    let sql = `UPDATE tbl_profissionalEspecialidade
               SET nome = '${profissionalEspecialidade.nome}'
               WHERE id = ${profissionalEspecialidade.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas profissionalEspecialidades
const selectAllProfissionalEspecialidade = async () => {
    let sql = `SELECT * FROM tbl_profissionalEspecialidade ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma profissionalEspecialidade pelo id
const selectByIdProfissionalEspecialidade = async (id) => {
    let sql = `SELECT * FROM tbl_profissionalEspecialidade
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de profissionalEspecialidade
const deleteProfissionalEspecialidade = async (id) => {
    let sql = `DELETE FROM tbl_profissionalEspecialidade
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertProfissionalEspecialidade,
    updateProfissionalEspecialidade,
    selectAllProfissionalEspecialidade,
    selectByIdProfissionalEspecialidade,
    deleteProfissionalEspecialidade
}