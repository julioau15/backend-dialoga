/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela categoria
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de categoria
const insertCategoria = async (categoria) => {
    let sql = `INSERT INTO tbl_categoria (nome)
               VALUES ('${categoria.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de categoria
const updateCategoria = async (categoria) => {
    let sql = `UPDATE tbl_categoria
               SET nome = '${categoria.nome}'
               WHERE id = ${categoria.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas categorias
const selectAllCategoria = async () => {
    let sql = `SELECT * FROM tbl_categoria ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma categoria pelo id
const selectByIdCategoria = async (id) => {
    let sql = `SELECT * FROM tbl_categoria
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de categoria
const deleteCategoria = async (id) => {
    let sql = `DELETE FROM tbl_categoria
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertCategoria,
    updateCategoria,
    selectAllCategoria,
    selectByIdCategoria,
    deleteCategoria
}