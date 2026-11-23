const { test } = require('node:test')
const assert = require('node:assert')
const { motivoBloqueioExclusao } = require('../controller/administrador/controller_administrador.js')

test('não remove a própria conta', () => {
    assert.strictEqual(
        motivoBloqueioExclusao({ solicitante: { id: 2, id_administrador_criador: 1 }, alvo: { id: 2 }, totalAdmins: 3 }),
        'Não é possível remover a própria conta.'
    )
})

test('não remove quem criou o seu perfil', () => {
    assert.strictEqual(
        motivoBloqueioExclusao({ solicitante: { id: 2, id_administrador_criador: 1 }, alvo: { id: 1 }, totalAdmins: 3 }),
        'Não é possível remover o administrador que criou o seu perfil.'
    )
})

test('não remove o último administrador', () => {
    assert.strictEqual(
        motivoBloqueioExclusao({ solicitante: { id: 2, id_administrador_criador: null }, alvo: { id: 3 }, totalAdmins: 1 }),
        'Não é possível remover o último administrador.'
    )
})

test('caso permitido -> null (admin antigo sem criador não bloqueia)', () => {
    assert.strictEqual(
        motivoBloqueioExclusao({ solicitante: { id: 1, id_administrador_criador: null }, alvo: { id: 2 }, totalAdmins: 2 }),
        null
    )
})
