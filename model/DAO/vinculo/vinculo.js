/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela vinculo
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de vinculo
const insertVinculo = async (vinculo) => {
    let sql = `INSERT INTO tbl_vinculo (nome)
               VALUES ('${vinculo.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de vinculo
const updateVinculo = async (vinculo) => {
    let sql = `UPDATE tbl_vinculo
               SET nome = '${vinculo.nome}'
               WHERE id = ${vinculo.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas vinculos
const selectAllVinculo = async () => {
    let sql = `SELECT * FROM tbl_vinculo ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma vinculo pelo id
const selectByIdVinculo = async (id) => {
    let sql = `SELECT * FROM tbl_vinculo
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de vinculo
const deleteVinculo = async (id) => {
    let sql = `DELETE FROM tbl_vinculo
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertVinculo,
    updateVinculo,
    selectAllVinculo,
    selectByIdVinculo,
    deleteVinculo
}