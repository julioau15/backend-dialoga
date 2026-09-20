/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela administradorProfissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de administradorProfissional
const insertAdministradorProfissional = async (administradorProfissional) => {
    let sql = `INSERT INTO tbl_administrador_profissional (status_aprovacao, data_decisao, criado_em, id_profissional, id_administrador)
               VALUES (?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            administradorProfissional.status_aprovacao,
            administradorProfissional.data_decisao,
            administradorProfissional.criado_em,
            administradorProfissional.id_profissional,
            administradorProfissional.id_administrador
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de administradorProfissional
const updateAdministradorProfissional = async (administradorProfissional) => {
    let sql = `UPDATE tbl_administrador_profissional
               SET status_aprovacao = ?,
                   data_decisao = ?,
                   criado_em = ?,
                   id_profissional = ?,
                   id_administrador = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            administradorProfissional.status_aprovacao,
            administradorProfissional.data_decisao,
            administradorProfissional.criado_em,
            administradorProfissional.id_profissional,
            administradorProfissional.id_administrador,
            administradorProfissional.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas administradorProfissionals
const selectAllAdministradorProfissional = async () => {
    let sql = `SELECT
                   id,
                   status_aprovacao,
                   data_decisao,
                   criado_em,
                   id_profissional,
                   id_administrador
               FROM tbl_administrador_profissional
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma administradorProfissional pelo id
const selectByIdAdministradorProfissional = async (id) => {
    let sql = `SELECT
                   id,
                   status_aprovacao,
                   data_decisao,
                   criado_em,
                   id_profissional,
                   id_administrador
               FROM tbl_administrador_profissional
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de administradorProfissional
const deleteAdministradorProfissional = async (id) => {
    let sql = `DELETE FROM tbl_administrador_profissional
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertAdministradorProfissional,
    updateAdministradorProfissional,
    selectAllAdministradorProfissional,
    selectByIdAdministradorProfissional,
    deleteAdministradorProfissional
}