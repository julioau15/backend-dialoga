/*************************************************************************************
 * Objetivo: Middleware que libera a rota só para o administrador (nível 0).
 * Usado nas listagens genéricas que devolvem dados de TODOS os pacientes
 * (registros de humor, tratamentos, pacientes): paciente e profissional usam as
 * rotas /me e /pacientes/:id/indicadores-compartilhados, que conferem dono e consentimento.
 * *********************************************************************************/

const { decodeJWT } = require('../../middleware/middlewareJWT.js')

const somenteAdmin = async (req, res, next) => {
    const decoded = await decodeJWT(req.headers['x-access-token'])
    if (decoded.status && Number(decoded.decode.nivel) === 0) return next()
    return res.status(403).json({
        status: false,
        status_code: 403,
        message: 'Acesso negado. Use as rotas do próprio paciente ou os indicadores compartilhados.'
    })
}

module.exports = { somenteAdmin }
