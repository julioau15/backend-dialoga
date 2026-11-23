/*************************************************************************************
 * Objetivo: Validar celular brasileiro (mesma regra do front em src/utils/validators.js)
 * Data: 22/11/2026
 * Versão: 1.0
 * *********************************************************************************/

// DDDs válidos da Anatel
const DDDS_VALIDOS = new Set([
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 24, 27, 28,
    31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49,
    51, 53, 54, 55,
    61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79,
    81, 82, 83, 84, 85, 86, 87, 88, 89,
    91, 92, 93, 94, 95, 96, 97, 98, 99
])

// só máscara permitida: dígitos, espaço, parênteses, hífen e o "+55" opcional
const CARACTERES_PERMITIDOS = /^[\d\s()+-]*$/

// celular com DDD: 11 dígitos depois de tirar a máscara, DDD existente,
// terceiro dígito 9 e número (sem o DDD) que não é todo do mesmo dígito
const celularValido = (texto) => {
    if (typeof texto !== 'string' || !CARACTERES_PERMITIDOS.test(texto)) return false

    const digitos = texto.replace(/\D/g, '')
    if (digitos.length !== 11) return false
    if (!DDDS_VALIDOS.has(Number(digitos.slice(0, 2)))) return false
    if (digitos[2] !== '9') return false
    if (/^(\d)\1+$/.test(digitos.slice(2))) return false

    return true
}

// campo opcional: vazio (ou o texto "undefined"/"null" que algumas rotas geram) conta como não informado
const celularInformado = (texto) => {
    if (texto === undefined || texto === null) return false
    const valor = String(texto).trim()
    return valor !== '' && valor !== 'undefined' && valor !== 'null'
}

module.exports = {
    celularValido,
    celularInformado
}
