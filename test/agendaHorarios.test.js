const { test } = require('node:test')
const assert = require('node:assert')
const { horariosDoDia, diasComHorariosLivres, PASSO_MINUTOS, DURACAO_MINUTOS } = require('../controller/module/agendaHorarios.js')

// terça-feira (id 3 em tbl_dias_da_semana: 1 domingo ... 7 sábado)
const TERCA = '2026-12-01'
const DISPONIBILIDADE = [{ hora_inicio: '08:00:00', hora_fim: '12:00:00', tipo_repeticao: 'semanal', dias: [3] }]
const AGORA = { data: '2026-11-01', hora: '00:00' }

test('passo de 30 minutos e duração de 60', () => {
    assert.strictEqual(PASSO_MINUTOS, 30)
    assert.strictEqual(DURACAO_MINUTOS, 60)
})

test('08:00 a 12:00 numa terça -> horários de meia em meia hora até 11:00', () => {
    assert.deepStrictEqual(horariosDoDia(DISPONIBILIDADE, TERCA), ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'])
})

test('consulta ocupada às 09:00 remove 08:30, 09:00 e 09:30', () => {
    const dias = diasComHorariosLivres(DISPONIBILIDADE, [`${TERCA} 09:00`], TERCA, TERCA, AGORA)
    assert.deepStrictEqual(dias, [{ data: TERCA, horarios: ['08:00', '10:00', '10:30', '11:00'] }])
})
