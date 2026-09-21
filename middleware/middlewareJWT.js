/**********************************************************************
 * Objetivo: Arquivo responsavel pela criação e configuração do JWT
 * Autor: Julio Augusto
 * Data: 20/10/2026
 * Versão: 1.0
 *********************************************************************/
// para instalar o JWT -> npm install jsonwebtoken --save

// import da biblioteca JWT (Jason Web Token)
const jwt = require('jsonwebtoken')
const SECRET = 'a1b2c3' // senha secreta para o token
const EXPIRES = '1d' 

// Cria um Token do JWT (retorna um Token)
const createJWT = async (payload) => {
    // gera o token
        // payload - identificação do usuario
        // SECRET - a chave secreta
        // ExpirenIn - tempo de expiração do token
    const token = jwt.sign(payload, SECRET, {expiresIn: EXPIRES})
    return token
}

// Valida a autenticidade do Token do JWT
const validateJWT = async (token) => {
    let response = {
        status: true
    }
    // valida a autenticidade
    jwt.verify(token, SECRET, async (err, decode) => {
        if (err) {
            response.status = false
            response.error = err
        }
    })
    
    return response
}

const decodeJWT = async (token) => {
    let response = {
        status: true
    }
    // decodifica o token
    jwt.verify(token, SECRET, async (err, decode) => {
        if (err) {
            response.status = false
            response.error = err
        } else {
            response.decode = decode
        }
    })
    
    return response
}

module.exports = {
    createJWT,
    validateJWT,
    decodeJWT
}