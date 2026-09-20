/***************************************************************************************************
 * Objetivo: Arquivo principal responsável pela configuração da criptografia de senha usando bcrypt
 * Autor: Julio Augusto
 * data: 20/09/2026
 * versão: 1.0
 * ************************************************************************************************/
// import do bcrypt
const bcrypt = require('bcrypt')

// cria um dificultador na criptografia
const SALT = 10

// Cria o HASH (senha criptografada)
const criarHash = async (senha) => await bcrypt.hash(senha, SALT)

const validarSenha = async (senha, hash) => await bcrypt.compare(senha, hash)

module.exports = {
    criarHash,
    validarSenha
}