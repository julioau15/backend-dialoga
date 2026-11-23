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
// função pura: monta o filtro da busca de pacientes
//   com "@"  -> { tipo: 'email', valor }   (e-mail exato)
//   sem "@"  -> { tipo: 'nome', padroes }  (cada palavra precisa casar com o INÍCIO de uma
//               palavra do nome: 'ma%' ou '% ma%'; AND entre as palavras do termo)
// O e-mail nunca entra no LIKE, então "ma" ou "gmail" não casam com o domínio.
const BUSCA_LIMITE = 8

const escaparLike = (texto) => texto.replace(/[\\%_]/g, (c) => '\\' + c)

const montarFiltroBusca = (termo) => {
    const texto = String(termo ?? '').trim()

    if (texto.includes('@')) return { tipo: 'email', valor: texto.toLowerCase() }

    const padroes = texto
        .split(/\s+/)
        .filter(Boolean)
        .map((palavra) => {
            const escapada = escaparLike(palavra)
            return [`${escapada}%`, `% ${escapada}%`]
        })

    return { tipo: 'nome', padroes }
}

// busca pacientes pelo início das palavras do nome ou pelo e-mail exato (no máximo 8)
// não devolve celular nem data de nascimento
const selectBuscaPaciente = async (busca) => {
    const filtro = montarFiltroBusca(busca)

    let where
    let valores = []

    if (filtro.tipo === 'email') {
        where = 'u.email = ?'
        valores.push(filtro.valor)
    } else {
        if (filtro.padroes.length === 0) return []
        where = filtro.padroes.map(() => "(p.nome_completo LIKE ? ESCAPE '\\\\' OR p.nome_completo LIKE ? ESCAPE '\\\\')").join(' AND ')
        filtro.padroes.forEach(([inicio, meio]) => valores.push(inicio, meio))
    }

    let sql = `SELECT
                   p.id,
                   p.nome_completo,
                   p.apelido,
                   p.foto_avatar,
                   p.status_atividade,
                   u.email
               FROM tbl_paciente AS p
               INNER JOIN tbl_usuario AS u ON u.id = p.id_usuario
               WHERE ${where}
               ORDER BY p.nome_completo ASC
               LIMIT ${BUSCA_LIMITE}`
    try {
        let response = await knexConex.raw(sql, valores)

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
    selectBuscaPaciente,
    montarFiltroBusca
}