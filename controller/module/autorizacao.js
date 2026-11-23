/*************************************************************************************
 * Objetivo: Localizar o administrador a partir do token (única forma de chegar ao
 *           admin pelo token). O token traz o id de tbl_usuario, e não o de
 *           tbl_administrador; por isso o admin é buscado pelo id_usuario.
 * Data: 22/11/2026
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('./configMessages.js')

const NIVEL_ADMINISTRADOR = 0

// dependências padrão carregadas só quando usadas (os testes injetam versões falsas)
const dependenciasPadrao = () => ({
    decodeJWT: require('../../middleware/middlewareJWT.js').decodeJWT,
    selectByIdUsuarioAdministrador: require('../../model/DAO/administrador/administrador.js').selectByIdUsuarioAdministrador
})

// devolve { ok: true, administrador } ou { ok: false, erro } (erro já no formato do configMessages)
const buscarAdministradorDoToken = async (token, dependencias = null) => {
    let message = JSON.parse(JSON.stringify(config_message))
    const { decodeJWT, selectByIdUsuarioAdministrador } = dependencias || dependenciasPadrao()

    let decodedToken = await decodeJWT(token)
    if(!decodedToken || !decodedToken.status || !decodedToken.decode) return { ok: false, erro: message.ERROR_INVALID_TOKEN } // 401

    message.ERROR_FORBIDDEN.message = 'Apenas administradores podem realizar esta ação.'

    if(Number(decodedToken.decode.nivel) !== NIVEL_ADMINISTRADOR) return { ok: false, erro: message.ERROR_FORBIDDEN } // 403

    let result = await selectByIdUsuarioAdministrador(decodedToken.decode.id)
    if(result === false) return { ok: false, erro: message.ERROR_INTERNAL_SERVER_MODEL } // 500
    if(!Array.isArray(result) || result.length < 1) return { ok: false, erro: message.ERROR_FORBIDDEN } // 403

    return { ok: true, administrador: result[0] }
}

module.exports = {
    buscarAdministradorDoToken
}
