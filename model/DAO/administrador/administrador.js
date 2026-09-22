/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela administrador
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de administrador
const insertAdministrador = async (administrador) => {
    let sql = `INSERT INTO tbl_administrador (nome_completo, email, senha_hash, senha_provisoria, celular, foto_avatar, papel, data_criacao)
               VALUES (?, ?, ?, 1, ?, ?, 'admin', date_format(now(), '%Y-%m-%d %H:%i:%s'))`

    try {
        let response = await knexConex.raw(sql, [
            administrador.nome_completo,
            administrador.email,
            administrador.senha_hash,
            administrador.celular || null,
            administrador.foto_avatar || null
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de administrador
const updateAdministrador = async (administrador) => {
    let sql = `UPDATE tbl_administrador
               SET nome_completo = ?,
                   senha_hash = ?,
                   celular = ?,
                   foto_avatar = ?,
                   senha_provisoria = 0
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            administrador.nome_completo,
            administrador.senha_hash,
            administrador.celular || null,
            administrador.foto_avatar || null,
            administrador.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todos administradores
const selectAllAdministrador = async () => {
    let sql = `SELECT
                   id,
                   nome_completo,
                   email,
                   senha_hash,
                   senha_provisoria,
                   celular,
                   foto_avatar,
                   papel,
                   data_criacao
               FROM tbl_administrador
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de um administrador pelo id
const selectByIdAdministrador = async (id) => {
    let sql = `SELECT
                   id,
                   nome_completo,
                   email,
                   senha_hash,
                   senha_provisoria,
                   celular,
                   foto_avatar,
                   papel,
                   data_criacao
               FROM tbl_administrador
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de administrador
const deleteAdministrador = async (id) => {
    let sql = `DELETE FROM tbl_administrador
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertAdministrador,
    updateAdministrador,
    selectAllAdministrador,
    selectByIdAdministrador,
    deleteAdministrador
}