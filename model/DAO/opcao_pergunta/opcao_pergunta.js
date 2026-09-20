/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela opcaoPergunta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de opcaoPergunta
const insertOpcaoPergunta = async (opcaoPergunta) => {
    let sql = `INSERT INTO tbl_opcao_pergunta (nome)
               VALUES ('${opcaoPergunta.nome}')`

    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0].insertId 

    } catch (error) {}

    return false
}

// update de opcaoPergunta
const updateOpcaoPergunta = async (opcaoPergunta) => {
    let sql = `UPDATE tbl_opcao_pergunta
               SET nome = '${opcaoPergunta.nome}'
               WHERE id = ${opcaoPergunta.id}`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas opcaoPerguntas
const selectAllOpcaoPergunta = async () => {
    let sql = `SELECT * FROM tbl_opcao_pergunta ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma opcaoPergunta pelo id
const selectByIdOpcaoPergunta = async (id) => {
    let sql = `SELECT * FROM tbl_opcao_pergunta
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de opcaoPergunta
const deleteOpcaoPergunta = async (id) => {
    let sql = `DELETE FROM tbl_opcao_pergunta
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertOpcaoPergunta,
    updateOpcaoPergunta,
    selectAllOpcaoPergunta,
    selectByIdOpcaoPergunta,
    deleteOpcaoPergunta
}