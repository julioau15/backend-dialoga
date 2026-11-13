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
               VALUES ("pendente", ?, now(), null, null, null, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            vinculo.origem_cadastro,
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
                   v.id,
                   v.status,
                   v.origem_cadastro,
                   v.data_solicitacao,
                   v.data_aceite,
                   v.data_inicio_acompanhamento,
                   v.data_fim,
                   v.id_profissional,
                   v.id_paciente,
                   p.status_atividade AS status_paciente
               FROM tbl_vinculo v
               INNER JOIN tbl_paciente p ON p.id = v.id_paciente
               WHERE (v.id_profissional = ? OR v.id_profissional = (SELECT id FROM tbl_profissional WHERE id_usuario = ? LIMIT 1))
                 AND (v.id_paciente = ? OR p.id_usuario = ?)`
    try {
        let response = await knexConex.raw(sql, [idProfissonal, idProfissonal, idPaciente, idPaciente])
        if(response) return response[0]
    } catch (error) { console.log(error) }

    return false
}

// verifica se já existe vínculo em andamento entre o paciente e o profissional (ids de tbl_paciente / tbl_profissional)
const selectVinculoExato = async (idPaciente, idProfissional) => {
    let sql = `SELECT id, status, origem_cadastro
               FROM tbl_vinculo
               WHERE id_paciente = ?
                 AND id_profissional = ?
                 AND status NOT IN ('2', 'recusado', 'encerrado')`
    try {
        let response = await knexConex.raw(sql, [idPaciente, idProfissional])
        if(response) return response[0]
    } catch (error) { console.log(error) }

    return false
}

// listar pacientes vinculados ao profissional, filtrando por nome e status
const selectByIdProfissional = async (idProfissional, filtro = {}) => {
    let sql = `
        SELECT
            tbl_paciente.id,
            tbl_paciente.nome_completo,
            tbl_paciente.apelido,
            tbl_paciente.status_atividade,
            tbl_paciente.foto_avatar,
            tbl_vinculo.id AS id_vinculo,
            tbl_vinculo.status AS status_vinculo,
            tbl_vinculo.origem_cadastro,
            COALESCE(tbl_vinculo.data_inicio_acompanhamento, tbl_vinculo.data_solicitacao) AS desde,
            CASE WHEN tbl_vinculo.status = 1 THEN tbl_usuario.email END AS email,
            CASE WHEN tbl_vinculo.status = 1 THEN tbl_paciente.celular END AS celular
        FROM tbl_vinculo
        INNER JOIN tbl_paciente
            ON tbl_paciente.id = tbl_vinculo.id_paciente
        INNER JOIN tbl_usuario
            ON tbl_usuario.id = tbl_paciente.id_usuario
        WHERE tbl_vinculo.id_profissional = ?
        AND tbl_vinculo.status IN (0, 1)
    `

    const params = [idProfissional]

    if (filtro.busca) {
        sql += `
            AND (
                tbl_paciente.nome_completo LIKE ?
                OR tbl_paciente.apelido LIKE ?
            )
        `
        params.push(`%${filtro.busca}%`, `%${filtro.busca}%`)
    }

    if (filtro.status && filtro.status.toLowerCase() !== 'todos') {
        sql += ` AND tbl_paciente.status_atividade = ?`
        params.push(filtro.status.toLowerCase())
    }

    sql += ` ORDER BY tbl_paciente.nome_completo ASC`

    try {
        const response = await knexConex.raw(sql, params)

        if (response) return response[0]
    } catch (error) {
        console.log(error)
    }

    return false
}

// listar profissionais pelo id do paciente, nome e status
const selectByIdPaciente = async (id, filtro = {}) => {
    let sql = `SELECT
                   tbl_profissional.id,
                   tbl_profissional.nome_completo,
                   tbl_profissional.cpf,
                   tbl_profissional.crp,
                   tbl_profissional.celular,
                   tbl_profissional.instituicao_clinica,
                   tbl_profissional.foto_avatar,
                   tbl_profissional.id_usuario,
                   tbl_vinculo.status,
                   tbl_vinculo.id AS id_vinculo,
                   tbl_vinculo.origem_cadastro,
                   COALESCE(tbl_vinculo.data_inicio_acompanhamento, tbl_vinculo.data_solicitacao) AS desde,
                   (SELECT GROUP_CONCAT(e.especialidade ORDER BY e.especialidade SEPARATOR ', ')
                      FROM tbl_profissional_especialidade pe
                      JOIN tbl_especialidade e ON e.id = pe.id_especialidade
                     WHERE pe.id_profissional = tbl_profissional.id) AS especialidades
               FROM tbl_vinculo
               INNER JOIN tbl_profissional
                   ON tbl_vinculo.id_profissional = tbl_profissional.id
               WHERE tbl_vinculo.id_paciente = ?`

    const params = [id]

    if (filtro.busca) {
        sql += ` AND tbl_profissional.nome_completo LIKE ?`
        params.push(`%${filtro.nome}%`)
    }

    if (filtro.status && filtro.status.toLowerCase() !== 'todos') {
        sql += ` AND tbl_vinculo.status = ?`
        params.push(filtro.status.toLowerCase())
    }

    if (filtro.cpf) {
        sql += ` AND tbl_profissional.cpf = ?`
        params.push(filtro.cpf.toLowerCase())
    }

    sql += ` ORDER BY tbl_profissional.nome_completo ASC`

    try {
        let response = await knexConex.raw(sql, params)

        if (response) return response[0]
    } catch (error) {
        console.log(error)
    }

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

// remover paciente/profissional da lista de acompanhamento
const deleteVinculoPacienteProfissional = async (idPaciente, idProfissional) => {
    let sql = `DELETE FROM tbl_vinculo
               WHERE id_profissional = ?
               AND id_paciente = ?;`

    try {
        let [response] = await knexConex.raw(sql, [
            idProfissional,
            idPaciente
        ])

        return response.affectedRows > 0
    } catch (error) {
        console.log(error)
        return false
    }
}

// aceitar um vinculo
const aceitarVinculo = async (id) => {
    let sql = `UPDATE tbl_vinculo
               SET status = 1,
                   data_aceite = now(),
                   data_inicio_acompanhamento = now()
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// recusar um vinculo
const recusarVinculo = async (id) => {
    let sql = `UPDATE tbl_vinculo
               SET status = 2
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            id
        ])

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
    selectVinculoExato,
    selectByIdPaciente,
    insertVinculoPaciente,
    aceitarVinculo,
    recusarVinculo
}