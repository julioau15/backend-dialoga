/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela vinculo
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de vinculo
const insertVinculo = async (vinculo) => {
    let sql = `INSERT INTO tbl_vinculo (status, origem_cadastro, data_solicitacao, data_aceite, data_inicio_acompanhamento, data_fim, id_profissional, id_paciente)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            vinculo.status,
            vinculo.origem_cadastro,
            vinculo.data_solicitacao,
            vinculo.data_aceite,
            vinculo.data_inicio_acompanhamento,
            vinculo.data_fim,
            vinculo.id_profissional,
            vinculo.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de vinculo
const updateVinculo = async (vinculo) => {
    let sql = `UPDATE tbl_vinculo
               SET status = ?,
                   origem_cadastro = ?,
                   data_solicitacao = ?,
                   data_aceite = ?,
                   data_inicio_acompanhamento = ?,
                   data_fim = ?,
                   id_profissional = ?,
                   id_paciente = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            vinculo.status,
            vinculo.origem_cadastro,
            vinculo.data_solicitacao,
            vinculo.data_aceite,
            vinculo.data_inicio_acompanhamento,
            vinculo.data_fim,
            vinculo.id_profissional,
            vinculo.id_paciente,
            vinculo.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas vinculos
const selectAllVinculo = async () => {
    let sql = `SELECT
                   id,
                   status,
                   origem_cadastro,
                   data_solicitacao,
                   data_aceite,
                   data_inicio_acompanhamento,
                   data_fim,
                   id_profissional,
                   id_paciente
               FROM tbl_vinculo
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma vinculo pelo id
const selectByIdVinculo = async (id) => {
    let sql = `SELECT
                   id,
                   status,
                   origem_cadastro,
                   data_solicitacao,
                   data_aceite,
                   data_inicio_acompanhamento,
                   data_fim,
                   id_profissional,
                   id_paciente
               FROM tbl_vinculo
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de vinculo
const deleteVinculo = async (id) => {
    let sql = `DELETE FROM tbl_vinculo
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertVinculo,
    updateVinculo,
    selectAllVinculo,
    selectByIdVinculo,
    deleteVinculo
}