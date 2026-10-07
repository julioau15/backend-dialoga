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
               VALUES (0, ?, ?, ?, ?, ?, ?, ?)`

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

const selectByIdPacienteProfissional = async (idPaciente, idProfissonal) => {
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
               WHERE id_profissional = ? AND id_paciente = ?`
    try {
        let response = await knexConex.raw(sql, [idProfissonal, idPaciente])
        if(response) return response[0]
    } catch (error) { console.log(error) }

    return false
}

// listar pacientes pelo id do profissional
const selectByIdProfissional = async (id) => {
    let sql = `SELECT
                   tbl_paciente.id,
                   tbl_paciente.nome,
                   tbl_paciente.email,
                   tbl_paciente.telefone,
                   tbl_paciente.cpf,
                   tbl_paciente.data_nascimento,
                   tbl_paciente.status
               FROM tbl_vinculo
               INNER JOIN tbl_paciente ON tbl_vinculo.id_paciente = tbl_paciente.id
               WHERE tbl_vinculo.id_profissional = ?`
    try {
        let response = await knexConex.raw(sql, [id])
    } catch (error) { console.log(error) }

    return false
}

// listar profissionais pelo id do paciente
const selectByIdPaciente = async (id) => {
    let sql = `SELECT
                   tbl_profissional.id,
                   tbl_profissional.nome,
                   tbl_profissional.email,
                   tbl_profissional.telefone,
                   tbl_profissional.cpf,
                   tbl_profissional.data_nascimento,
                   tbl_profissional.status
               FROM tbl_vinculo
               INNER JOIN tbl_profissional ON tbl_vinculo.id_profissional = tbl_profissional.id
               WHERE tbl_vinculo.id_paciente = ?`
    try {
        let response = await knexConex.raw(sql, [id])
    } catch (error) { console.log(error) }

    return false
}

// cria um vinculo pacinte-profissional pelo profissional
const insertVinculoProfissional = async (vinculo) => {
    let sql = `INSERT INTO tbl_vinculo (status, origem_cadastro, data_solicitacao, data_aceite, data_inicio_acompanhamento, data_fim, id_profissional, id_paciente)
               VALUES (0, 1, now(), NULL, NULL, NULL, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            vinculo.id_profissional,
            vinculo.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// cria um vinculo pacinte-profissional pelo paciente
const insertVinculoPaciente = async (vinculo) => {
    let sql = `INSERT INTO tbl_vinculo (status, origem_cadastro, data_solicitacao, data_aceite, data_inicio_acompanhamento, data_fim, id_profissional, id_paciente)
               VALUES (0, 2, now(), NULL, NULL, NULL, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            vinculo.id_profissional,
            vinculo.id_paciente
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// remover paciente/ profissional da lista de acompanhamento
const deleteVinculoPacienteProfissional = async (idPaciente, idProfissonal) => {
    let sql = ` DELETE FROM tbl_vinculo
                    INNER JOIN tbl_paciente ON tbl_vinculo.id_paciente = tbl_paciente.id
                WHERE tbl_vinculo.id_profissional = ? AND tbl_vinculo.id_paciente = ?`
    try {
        let response = await knexConex.raw(sql, [idProfissonal, idPaciente])
        if(response) return response
    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertVinculo,
    updateVinculo,
    selectAllVinculo,
    selectByIdVinculo,
    deleteVinculo,
    selectByIdProfissional,
    insertVinculoProfissional,
    deleteVinculoPacienteProfissional,
    selectByIdPacienteProfissional,
    selectByIdPaciente,
    insertVinculoPaciente
}