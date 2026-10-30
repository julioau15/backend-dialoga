/*************************************************************************************
 * Objetivo: Arquivo responsável pela conexão com o banco da tabela profissional
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/


const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// insert de profissional
const insertProfissional = async (profissional) => {
    let sql = `INSERT INTO tbl_profissional (nome_completo, cpf, crp, celular, instituicao_clinica, foto_avatar, id_usuario)
               VALUES (?, ?, ?, ?, ?, ?, ?)`

    try {
        let response = await knexConex.raw(sql, [
            profissional.nome_completo,
            profissional.cpf,
            profissional.crp,
            profissional.celular || null,
            profissional.instituicao_clinica || null,
            profissional.foto_avatar || null,
            profissional.id_usuario
        ])

        if(response) return response[0].insertId 

    } catch (error) { console.log(error) }

    return false
}

// verifica se já existe e-mail, CPF ou CRP cadastrados. Devolve o primeiro campo duplicado ('email' | 'cpf' | 'crp') ou null
const selectCampoDuplicado = async ({ email, cpf, crp, celular }) => {
    // compara o celular só pelos dígitos, ignorando ( ) - e espaços
    const limpa = (col) => `REPLACE(REPLACE(REPLACE(REPLACE(${col}, '(', ''), ')', ''), '-', ''), ' ', '')`
    try {
        let r
        if (email) {
            r = await knexConex.raw('SELECT 1 FROM tbl_usuario WHERE email = ? LIMIT 1', [email])
            if (r[0].length > 0) return 'email'
        }
        if (cpf) {
            r = await knexConex.raw('SELECT 1 FROM tbl_profissional WHERE cpf = ? LIMIT 1', [cpf])
            if (r[0].length > 0) return 'cpf'
        }
        if (crp) {
            r = await knexConex.raw('SELECT 1 FROM tbl_profissional WHERE crp = ? LIMIT 1', [crp])
            if (r[0].length > 0) return 'crp'
        }
        const digitos = String(celular ?? '').replace(/\D/g, '')
        if (digitos) {
            r = await knexConex.raw(
                `SELECT 1 FROM tbl_profissional WHERE ${limpa('celular')} = ?
                 UNION ALL
                 SELECT 1 FROM tbl_paciente WHERE ${limpa('celular')} = ?
                 LIMIT 1`,
                [digitos, digitos]
            )
            if (r[0].length > 0) return 'celular'
        }
    } catch (error) { console.log(error) }
    return null
}

// busca profissionais APROVADOS pelo nome (contém) ou e-mail (começa com) - usada na busca do paciente
const selectBuscaProfissionaisAprovados = async (termo) => {
    // escapa curingas do LIKE para o texto digitado ser tratado como texto
    const limpo = String(termo).replace(/[\\%_]/g, (c) => '\\' + c)
    let sql = `SELECT
                   p.id,
                   p.nome_completo,
                   p.foto_avatar,
                   (SELECT GROUP_CONCAT(e.especialidade ORDER BY e.especialidade SEPARATOR ', ')
                      FROM tbl_profissional_especialidade pe
                      JOIN tbl_especialidade e ON e.id = pe.id_especialidade
                     WHERE pe.id_profissional = p.id) AS especialidades
               FROM tbl_profissional p
               JOIN tbl_usuario u ON u.id = p.id_usuario
               WHERE (p.nome_completo LIKE ? OR u.email LIKE ?)
                 AND EXISTS (SELECT 1 FROM tbl_administrador_profissional ap
                              WHERE ap.id_profissional = p.id AND ap.status_aprovacao = 1)
               ORDER BY p.nome_completo
               LIMIT 8`
    try {
        let response = await knexConex.raw(sql, ['%' + limpo + '%', limpo + '%'])
        if(response) return response[0]
    } catch (error) { console.log(error) }
    return false
}

// update de profissional
const updateProfissional = async (profissional) => {
    let sql = `UPDATE tbl_profissional
               SET nome_completo = ?,
                   celular = ?,
                   foto_avatar = ?
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [
            profissional.nome_completo,
            profissional.celular || null,
            profissional.foto_avatar || null,
            profissional.id
        ])

        if(response) return response

    } catch (error) { console.log(error) }

    return false
}

// select de todas profissionals
const selectAllProfissional = async () => {
    let sql = `SELECT
                   id,
                   nome_completo,
                   cpf,
                   crp,
                   celular,
                   instituicao_clinica,
                   foto_avatar,
                   id_usuario
               FROM tbl_profissional
               ORDER BY id DESC`
    try {
        let response = await knexConex.raw(sql)


        if(response) return response[0]
 
    } catch (error) { console.log(error) }

    return false
}

// select de uma profissional pelo id
const selectByIdProfissional = async (id) => {
    let sql = `SELECT
                   id,
                   nome_completo,
                   cpf,
                   crp,
                   celular,
                   instituicao_clinica,
                   foto_avatar,
                   id_usuario
               FROM tbl_profissional
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response[0]
        
    } catch (error) { console.log(error) }

    return false
}

// delete de profissional
const deleteProfissional = async (id) => {
    let sql = `DELETE FROM tbl_profissional
               WHERE id = ?`
    try {
        let response = await knexConex.raw(sql, [id])


        if(response) return response
 
    } catch (error) { console.log(error) }

    return false
}

const selectByIdUsuarioProfissional = async (idUsuario) => {
    try {
        let sql = `
                    SELECT  id,
                            nome_completo,
                            cpf,
                            crp,
                            celular,
                            instituicao_clinica,
                            foto_avatar,
                            id_usuario
                    FROM tbl_profissional 
                    WHERE id_usuario = ?`
        let response = await knexConex.raw(sql, [idUsuario])
        return response.length > 0 ? response[0] : []
    } catch (error) {
        return false
    }
}

module.exports = {
    insertProfissional,
    selectCampoDuplicado,
    selectBuscaProfissionaisAprovados,
    updateProfissional,
    selectAllProfissional,
    selectByIdProfissional,
    deleteProfissional,
    selectByIdUsuarioProfissional
}