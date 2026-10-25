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
            "agendada", // status
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
                   id_vinculo = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            consulta.criado_por,
            consulta.nome_da_consulta,
            consulta.especialidade,
            consulta.data,
            consulta.hora,
            consulta.id_vinculo,
            consulta.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas consultas com filtros
const selectAllConsulta = async (filtro = {}) => {
    let sql = `
        SELECT
            tbl_consulta.id,
            tbl_consulta.criado_por,
            tbl_consulta.nome_da_conculta,
            tbl_consulta.especialidade,
            tbl_consulta.data,
            tbl_consulta.hora,
            tbl_consulta.status,
            tbl_consulta.id_vinculo
        FROM tbl_consulta
        INNER JOIN tbl_vinculo
            ON tbl_consulta.id_vinculo = tbl_vinculo.id
        INNER JOIN tbl_paciente
            ON tbl_vinculo.id_paciente = tbl_paciente.id
        WHERE 1 = 1
    `

    const params = []

    if (filtro.busca_paciente) {
        sql += ` AND tbl_paciente.nome_completo LIKE ?`
        params.push(`%${filtro.busca_paciente}%`)
    }

    if (filtro.data) {
        sql += ` AND DATE(tbl_consulta.data) = ?`
        params.push(filtro.data)
    }

    if (filtro.periodo) {
        const periodo = String(filtro.periodo).toLowerCase()

        if (periodo === 'dia') {
            sql += ` AND DATE(tbl_consulta.data) = CURDATE()`
        } else if (periodo === 'semana') {
            sql += ` AND YEARWEEK(tbl_consulta.data, 1) = YEARWEEK(CURDATE(), 1)`
        } else if (periodo === 'mes') {
            sql += ` AND YEAR(tbl_consulta.data) = YEAR(CURDATE())
                     AND MONTH(tbl_consulta.data) = MONTH(CURDATE())`
        }
    }

    console.log(sql)

    try {
        let response = await knexConex.raw(sql, params)

        if (response) return response[0]
    } catch (error) {
        console.log(error)
    }

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