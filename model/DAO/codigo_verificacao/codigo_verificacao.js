/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela codigo_verificacao
 * Data: 26/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de código de verificação
const insertCodigoVerificacao = async (codigo) => {
    let sql = `INSERT INTO tbl_codigo_verificacao (email, codigo_hash, finalidade, data_expiracao)
               VALUES (?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            codigo.email,
            codigo.codigo_hash,
            codigo.finalidade,
            codigo.data_expiracao
        ])

        if(response) return response[0].insertId

    } catch (error) { console.log(error) }

    return false
}

// update de código de verificação
const updateCodigoVerificacao = async (codigo) => {
    let sql = `UPDATE tbl_codigo_verificacao
               SET email = ?,
                   codigo_hash = ?,
                   finalidade = ?,
                   data_expiracao = ?,
                   data_utilizacao = ?,
                   tentativas = ?
               WHERE id_codigo = ?`
    try {
        let response = await knexConex.raw(sql, [
            codigo.email,
            codigo.codigo_hash,
            codigo.finalidade,
            codigo.data_expiracao,
            codigo.data_utilizacao ?? null,
            codigo.tentativas ?? 0,
            codigo.id_codigo
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todos os códigos
const selectAllCodigoVerificacao = async () => {
    let sql = `SELECT
                   id_codigo,
                   email,
                   codigo_hash,
                   finalidade,
                   data_expiracao,
                   data_utilizacao,
                   tentativas,
                   data_criacao
               FROM tbl_codigo_verificacao
               ORDER BY id_codigo DESC`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

// select de um código pelo id
const selectByIdCodigoVerificacao = async (id) => {
    let sql = `SELECT
                   id_codigo,
                   email,
                   codigo_hash,
                   finalidade,
                   data_expiracao,
                   data_utilizacao,
                   tentativas,
                   data_criacao
               FROM tbl_codigo_verificacao
               WHERE id_codigo = ?`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

// select do último código ainda válido (não utilizado e não expirado) por email e finalidade
const selectCodigoValidoByEmailFinalidade = async (email, finalidade) => {
    let sql = `SELECT
                   id_codigo,
                   email,
                   codigo_hash,
                   finalidade,
                   data_expiracao,
                   data_utilizacao,
                   tentativas,
                   data_criacao
               FROM tbl_codigo_verificacao
               WHERE email = ?
                 AND finalidade = ?
                 AND data_utilizacao IS NULL
                 AND data_expiracao > NOW()
               ORDER BY id_codigo DESC
               LIMIT 1`
    try {
        let response = await knexConex.raw(sql, [email, finalidade])

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

// incrementa o número de tentativas de um código
const incrementarTentativas = async (id) => {
    let sql = `UPDATE tbl_codigo_verificacao
               SET tentativas = tentativas + 1
               WHERE id_codigo = ?`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// marca o código como utilizado
const marcarComoUtilizado = async (id) => {
    let sql = `UPDATE tbl_codigo_verificacao
               SET data_utilizacao = NOW()
               WHERE id_codigo = ?
                 AND data_utilizacao IS NULL`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// invalida todos os códigos pendentes de um email/finalidade (usar antes de gerar um novo)
const invalidarCodigosPendentes = async (email, finalidade) => {
    let sql = `UPDATE tbl_codigo_verificacao
               SET data_utilizacao = NOW()
               WHERE email = ?
                 AND finalidade = ?
                 AND data_utilizacao IS NULL`
    try {
        let response = await knexConex.raw(sql, [email, finalidade])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// delete de código de verificação
const deleteCodigoVerificacao = async (id) => {
    let sql = `DELETE FROM tbl_codigo_verificacao
               WHERE id_codigo = ?`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// delete dos códigos expirados (limpeza)
const deleteCodigosExpirados = async () => {
    let sql = `DELETE FROM tbl_codigo_verificacao
               WHERE data_expiracao < NOW()`
    try {
        let response = await knexConex.raw(sql)

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertCodigoVerificacao,
    updateCodigoVerificacao,
    selectAllCodigoVerificacao,
    selectByIdCodigoVerificacao,
    selectCodigoValidoByEmailFinalidade,
    incrementarTentativas,
    marcarComoUtilizado,
    invalidarCodigosPendentes,
    deleteCodigoVerificacao,
    deleteCodigosExpirados
}