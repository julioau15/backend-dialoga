/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela consulta
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de consulta
const insertConsulta = async (consulta) => {
    let sql = `INSERT INTO tbl_consulta (criado_por, nome_da_conculta, especialidade, data, hora, status, id_vinculo)
               VALUES (?, ?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            consulta.criado_por,
            consulta.nome_da_conculta,
            consulta.especialidade,
            consulta.data,
            consulta.hora,
            consulta.status,
            consulta.id_vinculo
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de consulta
const updateConsulta = async (consulta) => {
    let sql = `UPDATE tbl_consulta
               SET criado_por = ?,
                   nome_da_conculta = ?,
                   especialidade = ?,
                   data = ?,
                   hora = ?,
                   status = ?,
                   id_vinculo = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            consulta.criado_por,
            consulta.nome_da_consulta,
            consulta.especialidade,
            consulta.data,
            consulta.hora,
            consulta.status,
            consulta.id_vinculo,
            consulta.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas consultas
const selectAllConsulta = async () => {
    let sql = `SELECT
                   id,
                   criado_por,
                   nome_da_conculta,
                   especialidade,
                   data,
                   hora,
                   status,
                   id_vinculo
               FROM tbl_consulta
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma consulta pelo id
const selectByIdConsulta = async (id) => {
    let sql = `SELECT
                   id,
                   criado_por,
                   nome_da_conculta,
                   especialidade,
                   data,
                   hora,
                   status,
                   id_vinculo
               FROM tbl_consulta
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de consulta
const deleteConsulta = async (id) => {
    let sql = `DELETE FROM tbl_consulta
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertConsulta,
    updateConsulta,
    selectAllConsulta,
    selectByIdConsulta,
    deleteConsulta
}