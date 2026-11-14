/*************************************************************************************
 * Objetivo: Regras de agenda (sem banco): data de hoje no fuso do Brasil, horários que o
 *           profissional atende e quais deles ainda estão livres.
 * Observação: a tabela de disponibilidade não tem duração da consulta, então cada consulta
 *             ocupa um horário de DURACAO_MINUTOS (1 hora). Para mudar, altere só essa constante.
 * *********************************************************************************/

const DURACAO_MINUTOS = 60
const FUSO_HORARIO = 'America/Sao_Paulo'

// Data e hora de agora no fuso de São Paulo: { data: 'YYYY-MM-DD', hora: 'HH:mm' }
const agoraNoFuso = (data = new Date()) => {
    const partes = new Intl.DateTimeFormat('en-CA', {
        timeZone: FUSO_HORARIO,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(data)
    const valor = (tipo) => partes.find(p => p.type === tipo).value
    return {
        data: `${valor('year')}-${valor('month')}-${valor('day')}`,
        hora: `${valor('hour')}:${valor('minute')}`
    }
}

// Aceita Date (o mysql2 devolve DATE assim), 'YYYY-MM-DD' e 'YYYY-MM-DDTHH:mm:ss...'. Devolve 'YYYY-MM-DD' ou null.
const paraIsoData = (valor) => {
    if (valor === undefined || valor === null || valor === '') return null

    let iso
    if (valor instanceof Date) {
        if (isNaN(valor.getTime())) return null
        const ano = String(valor.getFullYear()).padStart(4, '0')
        const mes = String(valor.getMonth() + 1).padStart(2, '0')
        const dia = String(valor.getDate()).padStart(2, '0')
        iso = `${ano}-${mes}-${dia}`
    } else {
        iso = String(valor).trim().slice(0, 10)
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null

    // recusa datas que não existem (2026-02-31)
    const [a, m, d] = iso.split('-').map(Number)
    const teste = new Date(Date.UTC(a, m - 1, d))
    if (teste.getUTCFullYear() !== a || teste.getUTCMonth() !== m - 1 || teste.getUTCDate() !== d) return null
    return iso
}

// Aceita '9:00', '09:00' e '09:00:00'. Devolve 'HH:mm' ou null.
const paraHoraHHmm = (valor) => {
    if (valor === undefined || valor === null) return null
    const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(valor).trim())
    if (!m) return null
    const h = Number(m[1])
    const min = Number(m[2])
    if (h > 23 || min > 59) return null
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

const horaParaMinutos = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number)
    return h * 60 + m
}

const minutosParaHora = (min) =>
    `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

// 0 = domingo ... 6 = sábado
const diaDaSemana = (iso) => {
    const [a, m, d] = iso.split('-').map(Number)
    return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}

const somarDias = (iso, n) => {
    const [a, m, d] = iso.split('-').map(Number)
    const nova = new Date(Date.UTC(a, m - 1, d + n))
    return nova.toISOString().slice(0, 10)
}

// ids da tbl_dias_da_semana: 1 Domingo ... 7 Sábado
const idDoDiaDaSemana = (iso) => diaDaSemana(iso) + 1

/**
 * Horários ('HH:mm') que o profissional atende em uma data, juntando todas as disponibilidades dele.
 * disponibilidade: { hora_inicio, hora_fim, tipo_repeticao, data_inicial, data_final, dias: [ids 1..7] }
 *  - 'unica'   : só na data_inicial
 *  - 'semanal' : nos dias da semana marcados (e dentro de data_inicial/data_final, se existirem)
 *  - 'periodo' : nos dias da semana marcados, dentro de data_inicial/data_final
 */
const horariosDoDia = (disponibilidades, iso) => {
    const horarios = new Set()

    for (const d of disponibilidades || []) {
        const inicio = paraHoraHHmm(d.hora_inicio)
        const fim = paraHoraHHmm(d.hora_fim)
        if (!inicio || !fim) continue

        const tipo = String(d.tipo_repeticao || '').toLowerCase()
        const dataInicial = paraIsoData(d.data_inicial)
        const dataFinal = paraIsoData(d.data_final)

        if (tipo === 'unica') {
            if (!dataInicial || dataInicial !== iso) continue
        } else {
            if (dataInicial && iso < dataInicial) continue
            if (dataFinal && iso > dataFinal) continue
            const dias = (d.dias || []).map(Number)
            if (!dias.includes(idDoDiaDaSemana(iso))) continue
        }

        const limite = horaParaMinutos(fim)
        for (let min = horaParaMinutos(inicio); min + DURACAO_MINUTOS <= limite; min += DURACAO_MINUTOS) {
            horarios.add(minutosParaHora(min))
        }
    }

    return [...horarios].sort()
}

// true se o horário já passou (ou é agora) — consulta tem que ser no futuro
const jaPassou = (iso, hhmm, agora = agoraNoFuso()) =>
    iso < agora.data || (iso === agora.data && hhmm <= agora.hora)

// true se uma consulta começando em [hhmm] bate com alguma já marcada (cada uma dura DURACAO_MINUTOS)
// ocupadasNoDia: horários 'HH:mm' das consultas não canceladas daquele profissional naquele dia
const conflitaComOcupadas = (hhmm, ocupadasNoDia) => {
    const inicio = horaParaMinutos(hhmm)
    return (ocupadasNoDia || []).some(o => Math.abs(horaParaMinutos(o) - inicio) < DURACAO_MINUTOS)
}

/**
 * Dias com horários livres entre [de, ate] (inclusive): [{ data, horarios: ['08:00', ...] }]
 * ocupados: lista de 'YYYY-MM-DD HH:mm' (consultas não canceladas do profissional)
 * Nunca devolve datas/horários no passado.
 */
const diasComHorariosLivres = (disponibilidades, ocupados, de, ate, agora = agoraNoFuso()) => {
    const ocupadasPorDia = {}
    for (const o of ocupados || []) {
        const [data, hora] = o.split(' ')
        if (!ocupadasPorDia[data]) ocupadasPorDia[data] = []
        ocupadasPorDia[data].push(hora)
    }

    const resultado = []
    let dia = de < agora.data ? agora.data : de

    while (dia <= ate) {
        const livres = horariosDoDia(disponibilidades, dia)
            .filter(h => !jaPassou(dia, h, agora))
            .filter(h => !conflitaComOcupadas(h, ocupadasPorDia[dia]))
        if (livres.length > 0) resultado.push({ data: dia, horarios: livres })
        dia = somarDias(dia, 1)
    }

    return resultado
}

module.exports = {
    DURACAO_MINUTOS,
    FUSO_HORARIO,
    agoraNoFuso,
    paraIsoData,
    paraHoraHHmm,
    somarDias,
    horariosDoDia,
    jaPassou,
    conflitaComOcupadas,
    diasComHorariosLivres
}
