const { test } = require('node:test')
const assert = require('node:assert')
const { consultasParaLembrar, consultasParaVespera, notificacaoPermitida } = require('../services/lembreteConsultas.js')

const CONSULTA = { id: 1, data: '2026-11-22', hora: '15:00', status: 'agendada' }

test('consulta às 15:00, agora 14:30, antecedência 30 -> devolve', () => {
    assert.deepStrictEqual(consultasParaLembrar([CONSULTA], { data: '2026-11-22', hora: '14:30' }, 30), [CONSULTA])
})

test('consulta às 15:00, agora 14:28, antecedência 30 -> não devolve', () => {
    assert.deepStrictEqual(consultasParaLembrar([CONSULTA], { data: '2026-11-22', hora: '14:28' }, 30), [])
})

test('consulta cancelada não recebe lembrete', () => {
    assert.deepStrictEqual(consultasParaLembrar([{ ...CONSULTA, status: 'cancelada' }], { data: '2026-11-22', hora: '14:30' }, 30), [])
})

test('antecedência que atravessa a meia-noite', () => {
    const c = { id: 2, data: '2026-11-23', hora: '00:30', status: 'agendada' }
    assert.deepStrictEqual(consultasParaLembrar([c], { data: '2026-11-22', hora: '23:30' }, 60), [c])
})

test('véspera: a partir das 18:00, as consultas de amanhã', () => {
    const amanha = { id: 3, data: '2026-11-23', hora: '09:00', status: 'agendada' }
    assert.deepStrictEqual(consultasParaVespera([CONSULTA, amanha], { data: '2026-11-22', hora: '18:00' }), [amanha])
    assert.deepStrictEqual(consultasParaVespera([amanha], { data: '2026-11-22', hora: '17:59' }), [])
})

test('preferências: tipo desligado bloqueia', () => {
    assert.strictEqual(notificacaoPermitida([{ categoria: 'agenda', tipo_especifico: 'lembrete_consulta', ativo: 0 }], 'agenda', 'lembrete_consulta'), false)
})

test('preferências: categoria desligada bloqueia, mas o tipo ligado tem prioridade', () => {
    assert.strictEqual(notificacaoPermitida([{ categoria: 'agenda', tipo_especifico: null, ativo: 0 }], 'agenda', 'nova_consulta'), false)
    assert.strictEqual(notificacaoPermitida([
        { categoria: 'agenda', tipo_especifico: null, ativo: 0 },
        { categoria: 'agenda', tipo_especifico: 'nova_consulta', ativo: 1 }
    ], 'agenda', 'nova_consulta'), true)
})

test('preferências: "Desligar todas" bloqueia tudo; sem linhas, permite', () => {
    assert.strictEqual(notificacaoPermitida([{ categoria: 'todas', tipo_especifico: null, ativo: 0 }], 'agenda', 'nova_consulta'), false)
    assert.strictEqual(notificacaoPermitida([], 'agenda', 'nova_consulta'), true)
})
