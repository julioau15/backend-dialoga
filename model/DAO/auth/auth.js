/***********************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD de autenticação de usuários (login, logout, recuperar senha)
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// valida o usuario
const selectAuthUsuario = async (usuario) => {

    let sql = `SELECT
                   id,
                   email,
                   senha_hash,
                   data_criacao,
                   nivel
               FROM tbl_usuario
               WHERE email = ?`

    let response = await knexConex.raw(sql, [usuario.email])

    if(response)
        return response[0]

    return false
}

module.exports = {
    selectAuthUsuario
}