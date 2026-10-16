/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela disponibilidade
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de disponibilidade
const insertDisponibilidade = async (disponibilidade) => {
    let sql = `INSERT INTO tbl_disponibilidade (hora_inicio, hora_fim, tipo_repeticao, data_inicial, data_final, id_profissional)
               VALUES (?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            disponibilidade.hora_inicio,
            disponibilidade.hora_fim,
            disponibilidade.tipo_repeticao,
            disponibilidade.data_inicial,
            disponibilidade.data_final,
            disponibilidade.id_profissional
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de disponibilidade
const updateDisponibilidade = async (disponibilidade) => {
    let sql = `UPDATE tbl_disponibilidade
               SET
                   hora_inicio = ?,
                   hora_fim = ?,
                   tipo_repeticao = ?,
                   data_inicial = ?,
                   data_final = ?,
                   id_profissional = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            disponibilidade.hora_inicio,
            disponibilidade.hora_fim,
            disponibilidade.tipo_repeticao,
            disponibilidade.data_inicial,
            disponibilidade.data_final,
            disponibilidade.id_profissional,
            disponibilidade.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas disponibilidades
const selectAllDisponibilidade = async () => {
    let sql = `SELECT
                   id,
                   hora_inicio,
                   hora_fim,
                   tipo_repeticao,
                   data_inicial,
                   data_final,
                   id_profissional
               FROM tbl_disponibilidade
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma disponibilidade pelo id
const selectByIdDisponibilidade = async (id) => {
    let sql = `SELECT
                   id,
                   hora_inicio,
                   hora_fim,
                   tipo_repeticao,
                   data_inicial,
                   data_final,
                   id_profissional
               FROM tbl_disponibilidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de disponibilidade
const deleteDisponibilidade = async (id) => {
    let sql = `DELETE FROM tbl_disponibilidade
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// seleciona todas as disponibilidades de um profissional pelo id do profissional
const selectAllDisponibilidadeByIdProfissional = async (idProfissional) => {
    let sql = `SELECT
                   id,
                   hora_inicio,
                   hora_fim,
                   tipo_repeticao,
                   data_inicial,
                   data_final,
                   id_profissional
               FROM tbl_disponibilidade
               WHERE id_profissional = ?
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql, [idProfissional])

        if(response) return response[0]

    }catch (error) { console.log(error) }
}

const insertDisponibilidadeByIdProfissional = async (disponibilidade, idProfissional) => {
    let sql = `INSERT INTO tbl_disponibilidade (hora_inicio, hora_fim, tipo_repeticao, data_inicial, data_final, id_profissional)
               VALUES (?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            disponibilidade.hora_inicio,
            disponibilidade.hora_fim,
            disponibilidade.tipo_repeticao,
            disponibilidade.data_inicial,
            disponibilidade.data_final,
            idProfissional
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

//insere uma nova disponibilidade para um profissional pelo id do profissional

module.exports = {
    insertDisponibilidade,
    updateDisponibilidade,
    selectAllDisponibilidade,
    selectByIdDisponibilidade,
    deleteDisponibilidade,
    selectAllDisponibilidadeByIdProfissional,
    insertDisponibilidadeByIdProfissional
}