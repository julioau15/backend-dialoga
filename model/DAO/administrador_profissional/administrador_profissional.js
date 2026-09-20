/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela tabela1
 * Data: 00/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de tabela1
const insertTabela2 = async (tabela1) => {
    let sql = `INSERT INTO tbl_tabela1 (nome)
               VALUES ('${tabela1.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de tabela1
const updateTabela2 = async (tabela1) => {
    let sql = `UPDATE tbl_tabela1
               SET nome = '${tabela1.nome}'
               WHERE id = ${tabela1.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas tabela1s
const selectAllTabela2 = async () => {
    let sql = `SELECT * FROM tbl_tabela1 ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma tabela1 pelo id
const selectByIdTabela2 = async (id) => {
    let sql = `SELECT * FROM tbl_tabela1
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de tabela1
const deleteTabela2 = async (id) => {
    let sql = `DELETE FROM tbl_tabela1
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertTabela2,
    updateTabela2,
    selectAllTabela2,
    selectByIdTabela2,
    deleteTabela2
}