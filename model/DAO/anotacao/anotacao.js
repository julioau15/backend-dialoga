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
    let sql = `INSERT INTO tbl_anotacao (nome)
               VALUES ('${anotacao.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de anotacao
const updateAnotacao = async (anotacao) => {
    let sql = `UPDATE tbl_anotacao
               SET nome = '${anotacao.nome}'
               WHERE id = ${anotacao.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas anotacaos
const selectAllAnotacao = async () => {
    let sql = `SELECT * FROM tbl_anotacao ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma anotacao pelo id
const selectByIdAnotacao = async (id) => {
    let sql = `SELECT * FROM tbl_anotacao
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de anotacao
const deleteAnotacao = async (id) => {
    let sql = `DELETE FROM tbl_anotacao
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertAnotacao,
    updateAnotacao,
    selectAllAnotacao,
    selectByIdAnotacao,
    deleteAnotacao
}