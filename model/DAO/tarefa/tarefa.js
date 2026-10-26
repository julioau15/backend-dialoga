/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela tarefa
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de tarefa
const insertTarefa = async (tarefa) => {
    let sql = `INSERT INTO tbl_tarefa (titulo, tipo, instrucoes, anexo_arquivo, is_rascunho, data_criacao, data_envio, id_profissional_criador, id_paciente_criador)
               VALUES (?, ?, ?, ?, ?, now(), null, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            tarefa.titulo,
            tarefa.tipo,
            tarefa.instrucoes,
            tarefa.anexo_arquivo || null,
            tarefa.is_rascunho,
            tarefa.id_profissional_criador || null,
            tarefa.id_paciente_criador || null
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de tarefa
const updateTarefa = async (tarefa) => {
    let sql = `UPDATE tbl_tarefa
               SET titulo = ?,
                   tipo = ?,
                   instrucoes = ?,
                   anexo_arquivo = ?,
                   is_rascunho = ?,
                   id_profissional_criador = ?,
                   id_paciente_criador = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            tarefa.titulo,
            tarefa.tipo,
            tarefa.instrucoes,
            tarefa.anexo_arquivo ? tarefa.anexo_arquivo : null,
            tarefa.is_rascunho,
            tarefa.id_profissional_criador ? tarefa.id_profissional_criador : null,
            tarefa.id_paciente_criador ? tarefa.id_paciente_criador : null,
            tarefa.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas tarefas
const selectAllTarefa = async () => {
    let sql = `SELECT
                   id,
                   titulo,
                   tipo,
                   instrucoes,
                   anexo_arquivo,
                   is_rascunho,
                   data_criacao,
                   data_envio,
                   id_profissional_criador,
                   id_paciente_criador
               FROM tbl_tarefa
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma tarefa pelo id
const selectByIdTarefa = async (id) => {
    let sql = `SELECT
                   id,
                   titulo,
                   tipo,
                   instrucoes,
                   anexo_arquivo,
                   is_rascunho,
                   data_criacao,
                   data_envio,
                   id_profissional_criador,
                   id_paciente_criador
               FROM tbl_tarefa
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de tarefa
const deleteTarefa = async (id) => {
    let sql = `DELETE FROM tbl_tarefa
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// listar tarefas por id do profissional
const selectTarefasByIdProfissional = async (idProfissional) => {
    let sql = `SELECT
                   id,
                   titulo,
                   tipo,
                   instrucoes,
                   anexo_arquivo,
                   is_rascunho,
                   data_criacao,
                   data_envio,
                   id_profissional_criador
               FROM tbl_tarefa
               WHERE id_profissional_criador = ?
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql, [idProfissional])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// listar tarefas por id do paciente
const selectTarefasByIdPaciente = async (idPaciente) => {
    let sql = `SELECT
                   id,
                   titulo,
                   tipo,
                   instrucoes,
                   anexo_arquivo,
                   is_rascunho,
                   data_criacao,
                   data_envio,
                   id_paciente_criador
               FROM tbl_tarefa
               WHERE id_paciente_criador = ?
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql, [idPaciente])
    }catch (error) { console.log(error) }

    return false
}

// insert de tarefa por id do profissional
const insertTarefaByIdProfissional = async (tarefa, idProfissional) => {
    let sql = `INSERT INTO tbl_tarefa (titulo, tipo, instrucoes, is_rascunho, data_criacao, data_envio, id_profissional_criador)
               VALUES (?, ?, ?, ?, now(), null, ?)`

    try {
        let response = await knexConex.raw(sql, [
            tarefa.titulo,
            tarefa.tipo,
            tarefa.instrucoes,
            tarefa.is_rascunho,
            idProfissional
        ])

        if(response) return response[0].insertId

    } catch (error) { console.log(error) }

    return false
}

// insert de tarefa por id do paciente
const insertTarefaByIdPaciente = async (tarefa, idPaciente) => {
    let sql = `INSERT INTO tbl_tarefa (titulo, tipo, instrucoes, anexo_arquivo, is_rascunho, data_criacao, data_envio, id_paciente_criador)
               VALUES (?, ?, null, ?, ?, now(), null, ?)`

    try {
        let response = await knexConex.raw(sql, [
            tarefa.titulo,
            tarefa.tipo,
            tarefa.anexo_arquivo || null,
            tarefa.is_rascunho,
            idPaciente
        ])

        if(response) return response[0].insertId

    } catch (error) { console.log(error) }

    return false
}

// enviar tarefa para o paciente
const enviarTarefaParaPaciente = async (idTarefa, idPaciente) => {
    let sql = `UPDATE tbl_tarefa
               SET id_paciente_criador = ?,
                   data_envio = now(),
                   is_rascunho = false
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [idPaciente, idTarefa])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertTarefa,
    updateTarefa,
    selectAllTarefa,
    selectByIdTarefa,
    deleteTarefa,
    selectTarefasByIdProfissional,
    selectTarefasByIdPaciente,
    insertTarefaByIdProfissional,
    insertTarefaByIdPaciente,
    enviarTarefaParaPaciente
}