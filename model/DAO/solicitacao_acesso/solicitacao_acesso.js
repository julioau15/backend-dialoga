/*************************************************************************************
 * Objetivo: Consultas e alterações das solicitações de acesso no banco de dados.
 * *********************************************************************************/

const knex = require('knex')
const knexConfig = require('../../database_config_knex/knexFile.js')
const knexConex = knex(knexConfig.development)

// O token contém o id do usuário. A solicitação usa o id do paciente/profissional.
const selectPerfilByIdUsuario = async (idUsuario, nivel) => {
    const tabela = nivel == 1 ? 'tbl_profissional' : 'tbl_paciente'
    let sql = `SELECT id FROM ${tabela} WHERE id_usuario = ? LIMIT 1`
    try {
        let response = await knexConex.raw(sql, [idUsuario])
        return response[0]
    } catch (error) { console.log(error) }
    return false
}

// Retorna somente a solicitação mais recente de cada par paciente/profissional.
const selectSolicitacoesByPerfil = async (idPerfil, nivel) => {
    let sql = `SELECT s.*
               FROM tbl_solicitacao_acesso s
               WHERE NOT EXISTS (
                   SELECT 1 FROM tbl_solicitacao_acesso recente
                   WHERE recente.id_profissional = s.id_profissional
                     AND recente.id_paciente = s.id_paciente
                     AND recente.id > s.id
               )`
    const params = []
    if (nivel == 1) {
        sql += ' AND s.id_profissional = ?'
        params.push(idPerfil)
    } else if (nivel == 2) {
        sql += ' AND s.id_paciente = ?'
        params.push(idPerfil)
    }
    sql += ' ORDER BY s.id DESC'
    try {
        let response = await knexConex.raw(sql, params)
        return response[0]
    } catch (error) { console.log(error) }
    return false
}

const selectByIdSolicitacaoAcesso = async (id) => {
    let sql = 'SELECT * FROM tbl_solicitacao_acesso WHERE id = ?'
    try {
        let response = await knexConex.raw(sql, [id])
        return response[0]
    } catch (error) { console.log(error) }
    return false
}

// O mesmo bloqueio é usado para criar, responder, editar, remover e consultar acesso.
const bloquearProfissional = async (conexao, idProfissional) => {
    let sql = 'SELECT id FROM tbl_profissional WHERE id = ? FOR UPDATE'
    await conexao.raw(sql, [idProfissional])
}

const selectUltimaSolicitacao = async (conexao, idProfissional, idPaciente) => {
    let sql = `SELECT * FROM tbl_solicitacao_acesso
               WHERE id_profissional = ? AND id_paciente = ?
               ORDER BY id DESC LIMIT 1`
    let response = await conexao.raw(sql, [idProfissional, idPaciente])
    return response[0][0]
}

const selectVinculoAtivo = async (conexao, idProfissional, idPaciente) => {
    let sql = `SELECT id FROM tbl_vinculo
               WHERE id_profissional = ? AND id_paciente = ?
                 AND status IN ('1', 'ativo') LIMIT 1`
    let response = await conexao.raw(sql, [idProfissional, idPaciente])
    return response[0].length > 0
}

const selectCategoriasByIdSolicitacao = async (idSolicitacao, conexao = knexConex) => {
    let sql = `SELECT categoria, autorizado FROM tbl_categoria_compartilhada
               WHERE id_solicitacao_acesso = ? ORDER BY id`
    try {
        let response = await conexao.raw(sql, [idSolicitacao])
        return response[0]
    } catch (error) {
        // Dentro de uma transação, o erro deve desfazer também as demais alterações.
        if (conexao !== knexConex) throw error
        console.log(error)
    }
    return false
}

// Substitui as escolhas anteriores sem acumular categorias duplicadas.
const substituirCategoriasCompartilhadas = async (conexao, idSolicitacao, categorias) => {
    let sqlDelete = 'DELETE FROM tbl_categoria_compartilhada WHERE id_solicitacao_acesso = ?'
    await conexao.raw(sqlDelete, [idSolicitacao])
    let sqlInsert = `INSERT INTO tbl_categoria_compartilhada
                     (categoria, autorizado, id_solicitacao_acesso) VALUES (?, 1, ?)`
    for (let categoria of categorias) {
        await conexao.raw(sqlInsert, [categoria, idSolicitacao])
    }
}

// Cria o pedido e a notificação juntos. Um pedido pendente/aprovado é reutilizado.
const insertSolicitacaoAcesso = async (solicitacaoAcesso) => {
    try {
        return await knexConex.transaction(async (conexao) => {
            let idProfissional = solicitacaoAcesso.id_profissional
            let idPaciente = solicitacaoAcesso.id_paciente
            await bloquearProfissional(conexao, idProfissional)

            let vinculoAtivo = await selectVinculoAtivo(conexao, idProfissional, idPaciente)
            if (!vinculoAtivo) return { semVinculo: true }

            let solicitacao = await selectUltimaSolicitacao(conexao, idProfissional, idPaciente)
            if (solicitacao && (solicitacao.status == 'pendente' || solicitacao.status == 'aprovada')) {
                return { solicitacao: solicitacao, criada: false }
            }

            let sql = `INSERT INTO tbl_solicitacao_acesso
                       (status, data_solicitacao, data_resposta, id_profissional, id_paciente)
                       VALUES ('pendente', NOW(), NULL, ?, ?)`
            let response = await conexao.raw(sql, [idProfissional, idPaciente])
            let id = response[0].insertId

            // data_criacao é NOT NULL e a tabela não tem valor padrão: sem ela o MySQL recusa o INSERT, a transação
            // inteira volta atrás e nem a solicitação nem a notificação chegam ao paciente.
            let sqlNotificacao = `INSERT INTO tbl_notificacao
                (titulo_mensagem, lida, data_criacao, referencia_evento, id_categoria, id_profissional, id_paciente)
                VALUES (?, 0, NOW(), 'solicitacao_acesso', 4, NULL, ?)`
            await conexao.raw(sqlNotificacao, [
                'Um profissional enviou uma solicitação de acesso aos seus indicadores.', idPaciente
            ])

            return {
                criada: true,
                solicitacao: { id: id, status: 'pendente', id_profissional: idProfissional, id_paciente: idPaciente }
            }
        })
    } catch (error) { console.log(error) }
    return false
}

// Status e categorias são gravados na mesma transação.
const updateCompartilhamentoSolicitacao = async (solicitacao, statusEsperado, novoStatus, categorias) => {
    try {
        return await knexConex.transaction(async (conexao) => {
            await bloquearProfissional(conexao, solicitacao.id_profissional)
            let atual = await selectUltimaSolicitacao(conexao, solicitacao.id_profissional, solicitacao.id_paciente)
            if (!atual || atual.id != solicitacao.id || atual.status != statusEsperado) {
                return { conflito: true }
            }

            let sql = `UPDATE tbl_solicitacao_acesso SET status = ?, data_resposta = NOW()
                       WHERE id = ? AND id_paciente = ?`
            await conexao.raw(sql, [novoStatus, atual.id, atual.id_paciente])
            await substituirCategoriasCompartilhadas(conexao, atual.id, categorias)
            return { solicitacao: { ...atual, status: novoStatus, categorias: categorias } }
        })
    } catch (error) { console.log(error) }
    return false
}

// Remove também pedidos antigos do mesmo par, evitando restaurar uma permissão anterior.
const deleteSolicitacaoAcesso = async (solicitacao) => {
    try {
        return await knexConex.transaction(async (conexao) => {
            await bloquearProfissional(conexao, solicitacao.id_profissional)
            let atual = await selectUltimaSolicitacao(conexao, solicitacao.id_profissional, solicitacao.id_paciente)
            if (!atual || atual.id != solicitacao.id) return { conflito: true }

            let sqlCategorias = `DELETE c FROM tbl_categoria_compartilhada c
                INNER JOIN tbl_solicitacao_acesso s ON s.id = c.id_solicitacao_acesso
                WHERE s.id_profissional = ? AND s.id_paciente = ?`
            await conexao.raw(sqlCategorias, [atual.id_profissional, atual.id_paciente])

            let sql = 'DELETE FROM tbl_solicitacao_acesso WHERE id_profissional = ? AND id_paciente = ?'
            await conexao.raw(sql, [atual.id_profissional, atual.id_paciente])
            return { removida: true }
        })
    } catch (error) { console.log(error) }
    return false
}

// Lê a autorização vigente e os registros no mesmo momento da transação.
const selectIndicadoresCompartilhados = async (idProfissional, idPaciente) => {
    try {
        return await knexConex.transaction(async (conexao) => {
            await bloquearProfissional(conexao, idProfissional)
            let vinculoAtivo = await selectVinculoAtivo(conexao, idProfissional, idPaciente)
            if (!vinculoAtivo) return { semVinculo: true }

            let solicitacao = await selectUltimaSolicitacao(conexao, idProfissional, idPaciente)
            if (!solicitacao || solicitacao.status != 'aprovada') {
                return { status: solicitacao ? solicitacao.status : 'sem_acesso', categorias: [], registros: [] }
            }

            let categorias = await selectCategoriasByIdSolicitacao(solicitacao.id, conexao)
            let sql = 'SELECT * FROM tbl_registro_humor WHERE id_paciente = ? ORDER BY data DESC'
            let response = await conexao.raw(sql, [idPaciente])

            // Tratamentos do paciente, cada um com seus horários (o controller só os libera se o paciente
            // compartilhou ao menos uma categoria).
            let sqlTratamentos = `SELECT id, nome_medicamento, dosagem, frequencia, lembrete_ativo, id_paciente
                                  FROM tbl_tratamento WHERE id_paciente = ? ORDER BY id DESC`
            let tratamentos = (await conexao.raw(sqlTratamentos, [idPaciente]))[0]
            if (tratamentos.length > 0) {
                let ids = tratamentos.map(t => t.id)
                let sqlHorarios = `SELECT id, horario, id_tratamento FROM tbl_horario_tratamento
                                   WHERE id_tratamento IN (${ids.map(() => '?').join(',')}) ORDER BY horario`
                let horarios = (await conexao.raw(sqlHorarios, ids))[0]
                for (let tratamento of tratamentos) {
                    tratamento.horarios = horarios.filter(h => h.id_tratamento == tratamento.id)
                }
            }

            return { status: 'aprovada', categorias: categorias, registros: response[0], tratamentos: tratamentos }
        })
    } catch (error) { console.log(error) }
    return false
}

module.exports = {
    selectPerfilByIdUsuario,
    selectSolicitacoesByPerfil,
    selectByIdSolicitacaoAcesso,
    selectCategoriasByIdSolicitacao,
    insertSolicitacaoAcesso,
    updateCompartilhamentoSolicitacao,
    deleteSolicitacaoAcesso,
    selectIndicadoresCompartilhados
}
