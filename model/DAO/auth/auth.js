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
               WHERE email = ?`

    let response = await knexConex.raw(sql, [usuario.email])

    if(response)
        return response[0]

    return false
}

// valida o usuario profissional
const selectAuthProfissional = async (usuario) => {

    let sql = `SELECT
                   id,
                   nome_completo,
                   email,
                   cpf,
                   crp,
                   senha_hash,
                   celular,
                   instituicao_clinica,
                   foto_avatar,
                   papel
               FROM tbl_profissional
               WHERE email = ?`

    let response = await knexConex.raw(sql, [usuario.email])

    if(response)
        return response[0]

    return false
}

// valida o usuario paciente
const selectAuthPaciente = async (usuario) => {

    let sql = `SELECT
                   id,
                   nome_completo,
                   apelido,
                   data_nascimento,
                   celular,
                   email,
                   senha_hash,
                   foto_avatar,
                   deseja_iniciar_registros,
                   primeiro_acesso_concluido,
                   status_atividade,
                   criado_em
               FROM tbl_paciente
               WHERE email = ?`

    let response = await knexConex.raw(sql, [usuario.email])

    if(response)
        return response[0]

    return false
}

module.exports = {
    selectAuthAdministrador,
    selectAuthProfissional,
    selectAuthPaciente
}