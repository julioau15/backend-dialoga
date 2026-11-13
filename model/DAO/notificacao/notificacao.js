/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela notificacao
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de notificacao
const insertNotificacao = async (notificacao) => {
    let sql = `INSERT INTO tbl_notificacao (titulo_mensagem, lida, data_criacao, referencia_evento, id_categoria, id_profissional, id_paciente)
               VALUES (?, ?, ?, ?, ?, ?, ?)`

    try {
        const dataCriacao = notificacao.data_criacao || new Date().toISOString().slice(0, 19).replace('T', ' ')
        let response = await knexConex.raw(sql, [
            notificacao.titulo_mensagem ?? null,
            notificacao.lida ?? 0,
            dataCriacao,
            notificacao.referencia_evento ?? null,
            notificacao.id_categoria ?? null,
            notificacao.id_profissional ?? null,
            notificacao.id_paciente ?? null
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de notificacao
const updateNotificacao = async (notificacao) => {
    let sql = `UPDATE tbl_notificacao
               SET titulo_mensagem = ?,
                   lida = ?,
                   data_criacao = ?,
                   referencia_evento = ?,
                   id_categoria = ?,
                   id_profissional = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        const dataCriacao = notificacao.data_criacao || new Date().toISOString().slice(0, 19).replace('T', ' ')
        let response = await knexConex.raw(sql, [
            notificacao.titulo_mensagem ?? null,
            notificacao.lida ?? 0,
            dataCriacao,
            notificacao.referencia_evento ?? null,
            notificacao.id_categoria ?? null,
            notificacao.id_profissional ?? null,
            notificacao.id_paciente ?? null,
            notificacao.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas notificacaos
const selectAllNotificacao = async () => {
    let sql = `SELECT
                   id,
                   titulo_mensagem,
                   lida,
                   data_criacao,
                   referencia_evento,
                   id_categoria,
                   id_profissional,
                   id_paciente
               FROM tbl_notificacao
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma notificacao pelo id
const selectByIdNotificacao = async (id) => {
    let sql = `SELECT
                   id,
                   titulo_mensagem,
                   lida,
                   data_criacao,
                   referencia_evento,
                   id_categoria,
                   id_profissional,
                   id_paciente
               FROM tbl_notificacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de notificacao
const deleteNotificacao = async (id) => {
    let sql = `DELETE FROM tbl_notificacao
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// seleciona notificacoes por id de paciente
const selectNotificacaoByIdPaciente = async (idPaciente, filtro = {}) => {
    let sql = `SELECT
                   id,
                   titulo_mensagem,
                   lida,
                   data_criacao,
                   referencia_evento,
                   id_categoria,
                   id_paciente
               FROM tbl_notificacao
               WHERE id_paciente = (SELECT id FROM tbl_paciente WHERE id_usuario = ? LIMIT 1)`

    const params = [idPaciente]

    if (filtro.aba) {
        const aba = String(filtro.aba).toLowerCase()

        if (aba === 'lida' || aba === 'lidas') {
            sql += ` AND lida = ?`
            params.push(1)
        } else if (aba === 'nao_lida' || aba === 'nao_lidas') {
            sql += ` AND lida = ?`
            params.push(0)
        }
    }

    sql += ` ORDER BY data_criacao DESC`

    try {
        let response = await knexConex.raw(sql, params)

        if (response) return response[0]

    } catch (error) {
        console.log(error)
    }

    return false
}

// seleciona notificacoes por id de profissional
const selectNotificacaoByIdProfissional = async (idProfissional, filtro = {}) => {
    let sql = `SELECT
                   id,
                   titulo_mensagem,
                   lida,
                   data_criacao,
                   referencia_evento,
                   id_categoria,
                   id_profissional
               FROM tbl_notificacao
               WHERE id_profissional = (SELECT id FROM tbl_profissional WHERE id_usuario = ? LIMIT 1)`

    const params = [idProfissional]

    if (filtro.aba) {
        const aba = String(filtro.aba).toLowerCase()

        if (aba === 'lida' || aba === 'lidas') {
            sql += ` AND lida = ?`
            params.push(1)
        } else if (aba === 'nao_lida' || aba === 'nao_lidas') {
            sql += ` AND lida = ?`
            params.push(0)
        }
    }

    sql += ` ORDER BY data_criacao DESC`

    try {
        let response = await knexConex.raw(sql, params)

        if (response) return response[0]

    } catch (error) {
        console.log(error)
    }

    return false
}

// marca notificacao como lida
const marcarNotificacaoComoLida = async (id) => {
    let sql = `UPDATE tbl_notificacao
               SET lida = 1
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])

        if(response) return response
        
    } catch (error) { console.log(error) }

    return false
}

// marcar todas notificacoes como lidas por id de paciente
const marcarTodasNotificacoesComoLidasByIdPaciente = async (idPaciente) => {
    let sql = `UPDATE tbl_notificacao
               SET lida = 1
               WHERE id_paciente = (SELECT id FROM tbl_paciente WHERE id_usuario = ? LIMIT 1)`
    try {
        let response = await knexConex.raw(sql, [idPaciente])

        if(response) return response
        
    } catch (error) { console.log(error) }

    return false
}

// marcar todas notificacoes como lidas por id de profissional
const marcarTodasNotificacoesComoLidasByIdProfissional = async (idProfissional) => {
    let sql = `UPDATE tbl_notificacao
               SET lida = 1
               WHERE id_profissional = (SELECT id FROM tbl_profissional WHERE id_usuario = ? LIMIT 1)`
    try {
        let response = await knexConex.raw(sql, [idProfissional])

        if(response) return response
        
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertNotificacao,
    updateNotificacao,
    selectAllNotificacao,
    selectByIdNotificacao,
    deleteNotificacao,
    selectNotificacaoByIdPaciente,
    selectNotificacaoByIdProfissional,
    marcarNotificacaoComoLida,
    marcarTodasNotificacoesComoLidasByIdPaciente,
    marcarTodasNotificacoesComoLidasByIdProfissional
}
