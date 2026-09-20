/***********************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD de autenticação de usuários (login, logout, recuperar senha)
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// valida o usuario adm
const selectAuthAdministrador = async (usuario) => {

    let sql = `SELECT *
               FROM tbl_administrador
               WHERE email = '${usuario.email}'`

    let response = await knexConex.raw(sql)

    if(response)
        return response[0]

    return false
}

// valida o usuario profissional
const selectAuthProfissional = async (usuario) => {

    let sql = `SELECT *
               FROM tbl_profissional
               WHERE email = '${usuario.email}'`

    let response = await knexConex.raw(sql)

    if(response)
        return response[0]

    return false
}

// valida o usuario paciente
const selectAuthPaciente = async (usuario) => {

    let sql = `SELECT *
               FROM tbl_paciente
               WHERE email = '${usuario.email}'`

    let response = await knexConex.raw(sql)

    if(response)
        return response[0]

    return false
}

module.exports = {
    selectAuthAdministrador,
    selectAuthProfissional,
    selectAuthPaciente
}