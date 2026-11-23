/*************************************************************************************
 * Objetivo: Notificações de agenda.
 *   - notificarSePermitido: cria a notificação só se o destinatário não desligou aquele tipo
 *     nas preferências; a categoria é buscada pelo nome (categoria + tipo_especifico).
 *   - lembrete automático das consultas (roda a cada minuto, fuso de São Paulo):
 *       profissional -> agenda / lembrete_atendimento, 30 min antes
 *       paciente     -> agenda / lembrete_consulta,    60 min antes
 *       os dois      -> agenda / lembrete_vespera,     a partir das 18:00 do dia anterior
 *     Cada lembrete é enviado uma única vez (referencia_evento = '<tipo>:<id_consulta>',
 *     ex.: 'lembrete_atendimento:12').
 * Observação: no Azure App Service a opção "Always On" precisa estar ligada; sem ela o processo
 *             dorme sem acessos e os lembretes param. Para desligar: LEMBRETE_CONSULTAS_ATIVO=false
 * *********************************************************************************/

const agenda = require('../controller/module/agendaHorarios.js')

// DAOs carregados só quando usados (as funções puras são testadas sem banco)
const dao = () => ({
    consulta: require('../model/DAO/consulta/consulta.js'),
    notificacao: require('../model/DAO/notificacao/notificacao.js'),
    categoria: require('../model/DAO/categoria/categoria.js'),
    preferencia: require('../model/DAO/preferencia_notificacao/preferencia_notificacao.js')
})

const INTERVALO_MS = 60 * 1000          // verifica a cada 1 minuto
const ANTECEDENCIA_PROFISSIONAL = 30    // minutos antes da consulta
const ANTECEDENCIA_PACIENTE = 60
const HORA_VESPERA = '18:00'
const CATEGORIA_TODAS = 'todas'         // linha do "Desligar todas" nas preferências

let executando = false
let temporizador = null
const idsCategoria = {}                 // cache 'categoria|tipo' -> id de tbl_categoria

// ---------------- funções puras ----------------

// minutos desde 1970 de uma data/hora "de parede" (sem fuso), para comparar e somar minutos
const minutosAbsolutos = (iso, hhmm) => {
    const [a, m, d] = iso.split('-').map(Number)
    const [h, min] = hhmm.split(':').map(Number)
    return Date.UTC(a, m - 1, d, h, min) / 60000
}

const agendada = (consulta) => String(consulta.status ?? '').toLowerCase() === 'agendada'

// consultas agendadas que começam em (agora + antecedência - 1 min, agora + antecedência]
// consultas: [{ id, data: 'YYYY-MM-DD', hora: 'HH:mm', status }] ; agora: { data, hora } no fuso
const consultasParaLembrar = (consultas, agora, antecedenciaMin) => {
    const alvo = minutosAbsolutos(agora.data, agora.hora) + antecedenciaMin

    return (consultas || []).filter((c) => {
        if (!agendada(c)) return false
        const inicio = minutosAbsolutos(c.data, c.hora)
        return inicio > alvo - 1 && inicio <= alvo
    })
}

// a partir das 18:00, as consultas agendadas de amanhã (a duplicidade é barrada pela referencia_evento)
const consultasParaVespera = (consultas, agora) => {
    if (agora.hora < HORA_VESPERA) return []
    const amanha = agenda.somarDias(agora.data, 1)
    return (consultas || []).filter((c) => agendada(c) && c.data === amanha)
}

// Preferências do destinatário (linhas de tbl_preferencia_notificacao).
// Prioridade: "Desligar todas" > linha do tipo > linha da categoria (tipo nulo) > ligado.
const notificacaoPermitida = (preferencias, categoria, tipo) => {
    const linhas = preferencias || []
    const ativo = (linha) => Number(linha.ativo) === 1

    const todas = linhas.find((l) => l.categoria === CATEGORIA_TODAS && l.tipo_especifico == null)
    if (todas && !ativo(todas)) return false

    const doTipo = linhas.find((l) => l.categoria === categoria && l.tipo_especifico === tipo)
    if (doTipo) return ativo(doTipo)

    const daCategoria = linhas.find((l) => l.categoria === categoria && l.tipo_especifico == null)
    if (daCategoria) return ativo(daCategoria)

    return true
}

// ---------------- banco ----------------

// id de tbl_categoria pelo nome (buscado uma vez e guardado)
const obterIdCategoria = async (categoria, tipo) => {
    const chave = `${categoria}|${tipo}`
    if (idsCategoria[chave]) return idsCategoria[chave]

    const result = await dao().categoria.selectCategoriaByTipo(categoria, tipo)
    if (result && result.length > 0) idsCategoria[chave] = result[0].id

    return idsCategoria[chave] ?? null
}

/**
 * Cria a notificação se o destinatário não desligou esse tipo.
 * destino: { id_profissional, id_paciente } (só um deles preenchido)
 * referencia: referencia_evento; com unica = true, não cria de novo se já existir para o destino.
 * Devolve true quando criou.
 */
const notificarSePermitido = async ({ categoria, tipo, destino, titulo, referencia, unica = false }) => {
    try {
        const { notificacao, preferencia } = dao()

        const preferencias = destino.id_profissional
            ? await preferencia.selectPreferenciasProfissional(destino.id_profissional)
            : await preferencia.selectPreferenciasPaciente(destino.id_paciente)
        if (preferencias === false) return false
        if (!notificacaoPermitida(preferencias, categoria, tipo)) return false

        const idCategoria = await obterIdCategoria(categoria, tipo)
        if (!idCategoria) {
            console.log(`[notificacoes] categoria ${categoria}/${tipo} não encontrada em tbl_categoria.`)
            return false
        }

        if (unica) {
            const existente = await notificacao.selectNotificacaoByReferenciaDestino(referencia, destino)
            if (!existente || existente.length > 0) return false
        }

        const id = await notificacao.insertNotificacao({
            titulo_mensagem: titulo,
            lida: 0,
            referencia_evento: referencia,
            id_categoria: idCategoria,
            id_profissional: destino.id_profissional ?? null,
            id_paciente: destino.id_paciente ?? null
        })
        return Boolean(id)

    } catch (error) { console.log(error) }
    return false
}

// ---------------- lembrete automático ----------------

const dataBr = (iso) => iso.split('-').reverse().join('/')

const lembrar = (consulta, tipo, destino, titulo) =>
    notificarSePermitido({
        categoria: 'agenda',
        tipo,
        destino,
        titulo,
        referencia: `${tipo}:${consulta.id}`,
        unica: true
    })

const verificarConsultas = async () => {
    if (executando) return
    executando = true

    try {
        const agora = agenda.agoraNoFuso()
        // hoje e amanhã cobrem as antecedências (até 60 min) e a véspera
        const linhas = await dao().consulta.selectConsultasAgendadasEntre(agora.data, agenda.somarDias(agora.data, 1))
        if (!linhas) return

        const consultas = linhas
            .map((c) => ({ ...c, data: agenda.paraIsoData(c.data), hora: agenda.paraHoraHHmm(c.hora) }))
            .filter((c) => c.data && c.hora)

        for (const c of consultasParaLembrar(consultas, agora, ANTECEDENCIA_PROFISSIONAL)) {
            await lembrar(c, 'lembrete_atendimento', { id_profissional: c.id_profissional, id_paciente: null },
                `Atendimento com ${c.nome_paciente} às ${c.hora} (em ${ANTECEDENCIA_PROFISSIONAL} minutos).`)
        }

        for (const c of consultasParaLembrar(consultas, agora, ANTECEDENCIA_PACIENTE)) {
            await lembrar(c, 'lembrete_consulta', { id_profissional: null, id_paciente: c.id_paciente },
                `Sua consulta "${c.nome_da_consulta}" começa às ${c.hora} (em 1 hora).`)
        }

        for (const c of consultasParaVespera(consultas, agora)) {
            await lembrar(c, 'lembrete_vespera', { id_profissional: c.id_profissional, id_paciente: null },
                `Amanhã (${dataBr(c.data)}) você atende ${c.nome_paciente} às ${c.hora}.`)
            await lembrar(c, 'lembrete_vespera', { id_profissional: null, id_paciente: c.id_paciente },
                `Lembrete: você tem consulta amanhã (${dataBr(c.data)}) às ${c.hora}.`)
        }

    } catch (error) { console.log(error) }
    finally { executando = false }
}

// Inicia a verificação periódica (chamada uma vez, quando a API sobe)
const iniciarLembreteConsultas = () => {
    if (process.env.LEMBRETE_CONSULTAS_ATIVO === 'false' || temporizador) return

    verificarConsultas()
    temporizador = setInterval(verificarConsultas, INTERVALO_MS)
}

module.exports = {
    consultasParaLembrar,
    consultasParaVespera,
    notificacaoPermitida,
    notificarSePermitido,
    verificarConsultas,
    iniciarLembreteConsultas
}
