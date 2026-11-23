const { test } = require('node:test')
const assert = require('node:assert')
const { montarFiltroBusca } = require('../model/DAO/paciente/paciente.js')

test("'MA' -> busca por nome com os padrões de início de palavra", () => {
    assert.deepStrictEqual(montarFiltroBusca('MA'), { tipo: 'nome', padroes: [['MA%', '% MA%']] })
})

test("'joao.paciente@email.com' -> e-mail exato", () => {
    assert.deepStrictEqual(montarFiltroBusca('joao.paciente@email.com'), { tipo: 'email', valor: 'joao.paciente@email.com' })
})

test("'maria cl' -> duas palavras (AND entre elas)", () => {
    assert.deepStrictEqual(montarFiltroBusca('maria cl'), { tipo: 'nome', padroes: [['maria%', '% maria%'], ['cl%', '% cl%']] })
})

test("espaços extras são ignorados e o e-mail vai em minúsculas", () => {
    assert.deepStrictEqual(montarFiltroBusca('  Lucia.Google@Gmail.com '), { tipo: 'email', valor: 'lucia.google@gmail.com' })
    assert.deepStrictEqual(montarFiltroBusca(' ana   b '), { tipo: 'nome', padroes: [['ana%', '% ana%'], ['b%', '% b%']] })
})

test("curingas do LIKE digitados pelo usuário são escapados", () => {
    assert.deepStrictEqual(montarFiltroBusca('%a_'), { tipo: 'nome', padroes: [['\\%a\\_%', '% \\%a\\_%']] })
})
