const { test } = require('node:test')
const assert = require('node:assert')
const { buscarAdministradorDoToken } = require('../controller/module/autorizacao.js')

const decodeValido = (decode) => async () => ({ status: true, decode })

test('token inválido -> status_code 401', async () => {
    const r = await buscarAdministradorDoToken('x', {
        decodeJWT: async () => ({ status: false }),
        selectByIdUsuarioAdministrador: async () => []
    })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.erro.status_code, 401)
})

test('nivel 2 (paciente) -> status_code 403', async () => {
    const r = await buscarAdministradorDoToken('x', {
        decodeJWT: decodeValido({ id: 5, nivel: 2 }),
        selectByIdUsuarioAdministrador: async () => [{ id: 1, id_usuario: 5 }]
    })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.erro.status_code, 403)
    assert.strictEqual(r.erro.message, 'Apenas administradores podem realizar esta ação.')
})

test('nivel 0 sem linha em tbl_administrador -> status_code 403', async () => {
    const r = await buscarAdministradorDoToken('x', {
        decodeJWT: decodeValido({ id: 10, nivel: 0 }),
        selectByIdUsuarioAdministrador: async () => []
    })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.erro.status_code, 403)
})

test('DAO devolve false -> status_code 500', async () => {
    const r = await buscarAdministradorDoToken('x', {
        decodeJWT: decodeValido({ id: 10, nivel: 0 }),
        selectByIdUsuarioAdministrador: async () => false
    })
    assert.strictEqual(r.ok, false)
    assert.strictEqual(r.erro.status_code, 500)
})

test('decode.id 10 e DAO devolve [{ id: 2, id_usuario: 10 }] -> ok true e administrador.id === 2', async () => {
    let idConsultado
    const r = await buscarAdministradorDoToken('x', {
        decodeJWT: decodeValido({ id: 10, nivel: 0 }),
        selectByIdUsuarioAdministrador: async (id) => { idConsultado = id; return [{ id: 2, id_usuario: 10 }] }
    })
    assert.strictEqual(r.ok, true)
    assert.strictEqual(r.administrador.id, 2)
    assert.strictEqual(idConsultado, 10)
})
