/*************************************************************************************
 * Objetivo: Arquivo responsável pelo envio de emails
 * Data: 26/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

// textos de acordo com a finalidade do código
const assuntos = {
    cadastro: 'Confirme seu cadastro',
    recuperar_senha: 'Recuperação de senha'
}

const enviarCodigoVerificacao = async (email, codigo, finalidade, minutosExpiracao) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: assuntos[finalidade] || 'Seu código de verificação',
            text: `Seu código de verificação é ${codigo}. Ele expira em ${minutosExpiracao} minutos. Se você não solicitou, ignore este email.`,
            html: `
                <p>Seu código de verificação é:</p>
                <h2 style="letter-spacing: 4px;">${codigo}</h2>
                <p>Ele expira em ${minutosExpiracao} minutos.</p>
                <p>Se você não solicitou, ignore este email.</p>`
        })

        return true

    } catch (error) { console.log(error) }

    return false
}

module.exports = {
    enviarCodigoVerificacao
}