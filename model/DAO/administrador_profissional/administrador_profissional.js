/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela administradorProfissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de administradorProfissional
const insertAdministradorProfissional = async (administradorProfissional) => {
    let sql = `INSERT INTO tbl_administrador_profissional (status_aprovacao, data_decisao, criado_em, id_profissional, id_administrador)
               VALUES (?, now(), now() , ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            administradorProfissional.status_aprovacao,
            administradorProfissional.id_profissional,
            administradorProfissional.id_administrador
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// cria a solicitação de aprovação PENDENTE (status NULL, sem admin e sem data de decisão)
const insertSolicitacaoPendente = async (idProfissional) => {
    let sql = `INSERT INTO tbl_administrador_profissional (status_aprovacao, data_decisao, criado_em, id_profissional, id_administrador)
               VALUES (NULL, NULL, now(), ?, NULL)`
    try {
        let response = await knexConex.raw(sql, [idProfissional])
        if(response) return response[0].insertId
    } catch (error) { console.log(error) }
    return false
}

// update de administradorProfissional
const updateAdministradorProfissional = async (administradorProfissional) => {
    let sql = `UPDATE tbl_administrador_profissional
               SET status_aprovacao = ?,
                   data_decisao = now()
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            administradorProfissional.status_aprovacao,
            administradorProfissional.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas administradorProfissionals (com o nome do admin responsável)
const selectAllAdministradorProfissional = async () => {
    let sql = `SELECT
                   ap.id,
                   ap.status_aprovacao,
                   ap.data_decisao,
                   ap.criado_em,
                   ap.id_profissional,
                   ap.id_administrador,
                   ap.id_admin_responsavel,
                   responsavel.nome_completo AS nome_admin_responsavel
               FROM tbl_administrador_profissional AS ap
               LEFT JOIN tbl_administrador AS responsavel ON responsavel.id = ap.id_admin_responsavel
               ORDER BY ap.id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma administradorProfissional pelo id
const selectByIdAdministradorProfissional = async (id) => {
    let sql = `SELECT
                   id,
                   status_aprovacao,
                   data_decisao,
                   criado_em,
                   id_profissional,
                   id_administrador
               FROM tbl_administrador_profissional
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de administradorProfissional
const deleteAdministradorProfissional = async (id) => {
    let sql = `DELETE FROM tbl_administrador_profissional
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

// aprovar administradorProfissional
// Só altera solicitação ainda pendente e atribuída a quem decide (ou sem responsável).
// Devolve { afetadas }: 0 significa que já foi decidida ou é de outro administrador.
const aprovarAdministradorProfissional = async (administradorProfissional) => {
    let sql = `UPDATE tbl_administrador_profissional
               SET status_aprovacao = 1,
                   data_decisao = now(),
                   id_administrador = ?
               WHERE id_profissional = ?
                 AND status_aprovacao IS NULL
                 AND (id_admin_responsavel IS NULL OR id_admin_responsavel = ?)`
    try {
        let response = await knexConex.raw(sql, [
            administradorProfissional.id_administrador,
            administradorProfissional.id_profissional,
            administradorProfissional.id_administrador
        ])

        if(response) return { afetadas: Number(response[0].affectedRows) }

    } catch (error) { console.log(error) }

    return false
}

// reprovar administradorProfissional
// Só altera solicitação ainda pendente e atribuída a quem decide (ou sem responsável).
// Devolve { afetadas }: 0 significa que já foi decidida ou é de outro administrador.
const reprovarAdministradorProfissional = async (administradorProfissional) => {
    let sql = `UPDATE tbl_administrador_profissional
               SET status_aprovacao = 0,
                   data_decisao = now(),
                   id_administrador = ?
               WHERE id_profissional = ?
                 AND status_aprovacao IS NULL
                 AND (id_admin_responsavel IS NULL OR id_admin_responsavel = ?)`
    try {
        let response = await knexConex.raw(sql, [
            administradorProfissional.id_administrador,
            administradorProfissional.id_profissional,
            administradorProfissional.id_administrador
        ])

        if(response) return { afetadas: Number(response[0].affectedRows) }

    } catch (error) { console.log(error) }

    return false
}


// solicitações pendentes ainda sem admin responsável (as mais antigas primeiro)
const selectPendentesSemResponsavel = async () => {
    let sql = `SELECT id
               FROM tbl_administrador_profissional
               WHERE status_aprovacao IS NULL AND id_admin_responsavel IS NULL
               ORDER BY criado_em, id`
    try {
        let response = await knexConex.raw(sql)
        if(response) return response[0]
    } catch (error) { console.log(error) }
    return false
}

// quantas solicitações pendentes cada administrador tem sob sua responsabilidade
const selectCargaPendentesPorAdministrador = async () => {
    let sql = `SELECT a.id, COUNT(ap.id) AS pendentes
               FROM tbl_administrador AS a
               LEFT JOIN tbl_administrador_profissional AS ap
                      ON ap.id_admin_responsavel = a.id AND ap.status_aprovacao IS NULL
               GROUP BY a.id`
    try {
        let response = await knexConex.raw(sql)
        if(response) return response[0].map((linha) => ({ id: Number(linha.id), pendentes: Number(linha.pendentes) }))
    } catch (error) { console.log(error) }
    return false
}

// atribui o responsável só se a solicitação continuar pendente e sem responsável
// (se dois admins distribuírem ao mesmo tempo, vale a primeira gravação)
const atribuirResponsavelAdministradorProfissional = async (id, idAdministrador) => {
    let sql = `UPDATE tbl_administrador_profissional
               SET id_admin_responsavel = ?
               WHERE id = ? AND status_aprovacao IS NULL AND id_admin_responsavel IS NULL`
    try {
        let response = await knexConex.raw(sql, [idAdministrador, id])
        if(response) return { afetadas: Number(response[0].affectedRows) }
    } catch (error) { console.log(error) }
    return false
}

module.exports = {
    selectPendentesSemResponsavel,
    selectCargaPendentesPorAdministrador,
    atribuirResponsavelAdministradorProfissional,
    insertAdministradorProfissional,
    updateAdministradorProfissional,
    selectAllAdministradorProfissional,
    selectByIdAdministradorProfissional,
    deleteAdministradorProfissional,
    insertSolicitacaoPendente,
    aprovarAdministradorProfissional,
    reprovarAdministradorProfissional
}