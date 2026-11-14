/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela paciente
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de paciente
const insertPaciente = async (paciente) => {
    let sql = `INSERT INTO tbl_paciente (nome_completo, celular,foto_avatar, primeiro_acesso_concluido, status_atividade, id_usuario)
               VALUES (?, ?, ?, 0, 'ativo', ?)`

    try {
        let response = await knexConex.raw(sql, [
            paciente.nome_completo,
            paciente.celular || null,
            paciente.foto_avatar || null,
            paciente.id_usuario
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// update de paciente
const updatePaciente = async (paciente) => {
    let sql = `UPDATE tbl_paciente
               SET nome_completo = ?,
                   apelido = ?,
                   data_nascimento = COALESCE(?, data_nascimento),
                   celular = ?,
                   foto_avatar = COALESCE(?, foto_avatar),
                   primeiro_acesso_concluido = 1
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            paciente.nome_completo,
            paciente.apelido || null,
            paciente.data_nascimento || null,
            paciente.celular || null,
            paciente.foto_avatar || null,
            paciente.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas pacientes
const selectAllPaciente = async () => {
    let sql = `SELECT
                   id,
                   nome_completo,
                   apelido,
                   data_nascimento,
                   celular,
                   foto_avatar,
                   primeiro_acesso_concluido,
                   status_atividade,
                   id_usuario
               FROM tbl_paciente
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma paciente pelo id
const selectByIdPaciente = async (id) => {
    let sql = `SELECT
                   id,
                   nome_completo,
                   apelido,
                   data_nascimento,
                   celular,
                   foto_avatar,
                   primeiro_acesso_concluido,
                   status_atividade,
                   id_usuario
               FROM tbl_paciente
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// select de um paciente pelo id do usuario
const selectByIdUsuarioPaciente = async (idUsuario) => {
    let sql = `SELECT
                   id,
                   nome_completo,
                   apelido,
                   data_nascimento,
                   celular,
                   foto_avatar,
                   primeiro_acesso_concluido,
                   status_atividade,
                   id_usuario
               FROM tbl_paciente
               WHERE id_usuario = ?`
    try {
        let response = await knexConex.raw(sql, [idUsuario])

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

// delete de paciente
const deletePaciente = async (id) => {
    let sql = `DELETE FROM tbl_paciente
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// update de paciente
const updatePrimeiroAcessoPaciente = async (paciente, id) => {
    let sql = `UPDATE tbl_paciente
               SET 
                   apelido = ?,
                   data_nascimento = ?,
                   primeiro_acesso_concluido = 1
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            paciente.apelido || null,
            paciente.data_nascimento || null,
            id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// busca de pacientes pelo nome ou email
const selectBuscaPaciente = async (busca) => {
    let sql = `SELECT
                   p.id,
                   p.nome_completo,
                   p.apelido,
                   p.data_nascimento,
                   p.celular,
                   p.foto_avatar,
                   p.primeiro_acesso_concluido,
                   p.status_atividade,
                   p.id_usuario,
                   u.email
               FROM tbl_paciente AS p
               INNER JOIN tbl_usuario AS u ON u.id = p.id_usuario
               WHERE p.nome_completo LIKE ?
                  OR u.email LIKE ?
               ORDER BY p.nome_completo ASC`
    try {
        let termo = `%${busca}%`
        let response = await knexConex.raw(sql, [termo, termo])

        if(response) return response[0]

    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    insertPaciente,
    updatePaciente,
    selectAllPaciente,
    selectByIdPaciente,
    deletePaciente,
    updatePrimeiroAcessoPaciente,
    selectByIdUsuarioPaciente,
    selectBuscaPaciente
}