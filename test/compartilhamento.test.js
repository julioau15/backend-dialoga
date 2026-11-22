const { test } = require('node:test')
const assert = require('node:assert')
const { obterCategoriasAutorizadas, tratamentosLiberados } = require('../controller/solicitacao_acesso/controller_solicitacao_acesso.js')

test('Tratamentos é uma categoria aceita e autorizada', () => {
    assert.deepStrictEqual(
        obterCategoriasAutorizadas([{ categoria: 'Humor', autorizado: 1 }, { categoria: 'Tratamentos', autorizado: 1 }]),
        ['Humor', 'Tratamentos']
    )
})

test('tratamentos só são liberados com a categoria Tratamentos numa solicitação aprovada', () => {
    assert.strictEqual(tratamentosLiberados('aprovada', ['Humor', 'Horas de sono']), false)
    assert.strictEqual(tratamentosLiberados('aprovada', ['Tratamentos']), true)
    assert.strictEqual(tratamentosLiberados('pendente', ['Tratamentos']), false)
})
