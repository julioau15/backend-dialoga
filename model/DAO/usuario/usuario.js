/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela usuario
 * Data: 23/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de usuario
const insertUsuario = async (usuario) => {
    let sql = `INSERT INTO tbl_usuario (email, senha_hash, data_criacao, nivel)
               VALUES (?, ?, NOW(), ?)`

    try {
        let response = await knexConex.raw(sql, 
            [
                usuario.email,
                usuario.senha_hash,
                usuario.nivel
            ]
        )

        if(response) return response[0].insertId 

    } catch (error) {console.log(error)}

    return false
}


// update de usuario
const updateUsuario = async (usuario) => {
    let sql = `UPDATE tbl_usuario
               SET senha_hash = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [usuario.senha_hash, usuario.id])

        if(response) return response

    } catch (error) {}

    return false
}

// select de todas usuarios
const selectAllUsuario = async () => {
    let sql = ` SELECT id, email, senha_hash, data_criacao, nivel 
                FROM tbl_usuario 
                ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) {}

    return false
}

// select de uma usuario pelo id
const selectByIdUsuario = async (id) => {
    let sql = ` SELECT id, email, senha_hash, data_criacao, nivel  
                FROM tbl_usuario
                WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
        
    } catch (error) {}

    return false
}

// delete de usuario
const deleteUsuario = async (id) => {
    let sql = `DELETE FROM tbl_usuario
               WHERE id = ${id}`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response
 
    } catch (error) {}

    return false
}

module.exports = {
    insertUsuario,
    updateUsuario,
    selectAllUsuario,
    selectByIdUsuario,
    deleteUsuario
}