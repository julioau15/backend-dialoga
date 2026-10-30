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
                   nivel,
                   id_google
               FROM tbl_usuario
               WHERE email = ?`

    let response = await knexConex.raw(sql, [usuario.email])

    if(response)
        return response[0]

    return false
}

// valida o usuario pelo id_google
const selectAuthUsuarioGoogle = async (id_google) => {

    let sql = `SELECT
                   id,
                   email,
                   senha_hash,
                   data_criacao,
                   nivel,
                   id_google
               FROM tbl_usuario
               WHERE id_google = ?`

    let response = await knexConex.raw(sql, [id_google])

    if(response)
        return response[0]

    return false
}

// retorna o status de aprovação do profissional ligado ao usuário
// null  -> sem registro ou pendente (em análise) | 1 -> aprovado | 0 -> recusado
const selectStatusAprovacaoProfissional = async (idUsuario) => {
    let sql = `SELECT ap.status_aprovacao
               FROM tbl_profissional p
               LEFT JOIN tbl_administrador_profissional ap ON ap.id_profissional = p.id
               WHERE p.id_usuario = ?
               ORDER BY ap.id DESC
               LIMIT 1`
    try {
        let response = await knexConex.raw(sql, [idUsuario])
        if (response && response[0].length > 0) return response[0][0].status_aprovacao
    } catch (error) { console.log(error) }
    return null
}

// atualiza somente a senha do usuário
const updateSenhaUsuario = async (id, senha_hash) => {
    let sql = `UPDATE tbl_usuario
               SET senha_hash = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [senha_hash, id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    selectAuthUsuario,
    selectAuthUsuarioGoogle,
    selectStatusAprovacaoProfissional,
    updateSenhaUsuario
}