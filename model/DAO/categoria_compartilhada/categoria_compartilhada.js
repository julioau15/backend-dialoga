/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela categoriaCompartilhada
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de categoriaCompartilhada
const insertCategoriaCompartilhada = async (categoriaCompartilhada) => {
    let sql = `INSERT INTO tbl_categoria_compartilhada (nome)
               VALUES ('${categoriaCompartilhada.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de categoriaCompartilhada
const updateCategoriaCompartilhada = async (categoriaCompartilhada) => {
    let sql = `UPDATE tbl_categoria_compartilhada
               SET nome = '${categoriaCompartilhada.nome}'
               WHERE id = ${categoriaCompartilhada.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas categoriaCompartilhadas
const selectAllCategoriaCompartilhada = async () => {
    let sql = `SELECT * FROM tbl_categoria_compartilhada ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma categoriaCompartilhada pelo id
const selectByIdCategoriaCompartilhada = async (id) => {
    let sql = `SELECT * FROM tbl_categoria_compartilhada
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de categoriaCompartilhada
const deleteCategoriaCompartilhada = async (id) => {
    let sql = `DELETE FROM tbl_categoria_compartilhada
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertCategoriaCompartilhada,
    updateCategoriaCompartilhada,
    selectAllCategoriaCompartilhada,
    selectByIdCategoriaCompartilhada,
    deleteCategoriaCompartilhada
}