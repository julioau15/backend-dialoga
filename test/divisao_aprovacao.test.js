const { test } = require('node:test')
const assert = require('node:assert')
const { podeDecidir, escolherResponsavel } = require('../controller/administrador_profissional/controller_administrador_profissional.js')

test('podeDecidir: já decidida -> ja_decidida', () => {
    assert.strictEqual(podeDecidir({ status_aprovacao: 1, id_admin_responsavel: 2 }, 2), 'ja_decidida')
    assert.strictEqual(podeDecidir({ status_aprovacao: 0, id_admin_responsavel: null }, 2), 'ja_decidida')
})

test('podeDecidir: atribuída a outro admin -> outro_responsavel', () => {
    assert.strictEqual(podeDecidir({ status_aprovacao: null, id_admin_responsavel: 1 }, 2), 'outro_responsavel')
})

test('podeDecidir: atribuída a mim -> ok', () => {
    assert.strictEqual(podeDecidir({ status_aprovacao: null, id_admin_responsavel: 2 }, 2), 'ok')
})

test('podeDecidir: sem responsável (admin removido) -> ok', () => {
    assert.strictEqual(podeDecidir({ status_aprovacao: null, id_admin_responsavel: null }, 2), 'ok')
})

test('escolherResponsavel: admin com menos pendentes', () => {
    assert.strictEqual(escolherResponsavel([{ id: 1, pendentes: 3 }, { id: 2, pendentes: 1 }, { id: 3, pendentes: 2 }]), 2)
})

test('escolherResponsavel: empate -> menor id', () => {
    assert.strictEqual(escolherResponsavel([{ id: 3, pendentes: 0 }, { id: 1, pendentes: 0 }]), 1)
})

test('escolherResponsavel: sem admins -> null', () => {
    assert.strictEqual(escolherResponsavel([]), null)
})

test('escolherResponsavel: distribui em sequência sem repetir o mesmo admin', () => {
    const cargas = [{ id: 1, pendentes: 0 }, { id: 2, pendentes: 0 }]
    const escolhidos = []
    for (let i = 0; i < 4; i++) {
        const id = escolherResponsavel(cargas)
        escolhidos.push(id)
        cargas.find((c) => c.id === id).pendentes++
    }
    assert.deepStrictEqual(escolhidos, [1, 2, 1, 2])
})
