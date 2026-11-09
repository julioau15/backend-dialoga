/*************************************************************************************
 * Objetivo: Arquivo responsável pelo CRUD da tabela administrador
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

const config_message = require('../module/configMessages.js')
const administradorDAO = require('../../model/DAO/administrador/administrador.js')
const usuarioController = require('../usuario/controller_usuario.js')
const usuarioDAO = require('../../model/DAO/usuario/usuario.js')
const {uploadFiles} = require('../upload/controller_upload_azure.js')
const bcrypt = require('../../services/bcrypt.js')
const { decodeJWT } = require('../../middleware/middlewareJWT.js')
const crypto = require('crypto')
const { enviarSenhaAcesso } = require('../../services/email.js')

// inserir novo administrador
const inserirNovaAdministrador = async (administrador, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(administrador, contentType)
        if (validar) return validar

        // Realiza o upload da imagem do administrador
        if (foto_avatar) {
            let urlImagem = await uploadFiles(foto_avatar)

            if (!urlImagem) {
                return message.ERROR_INTERNAL_SERVER_CONTROLLER
            }

            administrador.foto_avatar = urlImagem
        }

        // gera a senha aleatória (ignora qualquer senha enviada no body)
        const senhaGerada = gerarSenhaAleatoria(8)
        administrador.senha = senhaGerada
        administrador.senha_hash = await bcrypt.criarHash(senhaGerada)
        administrador.nivel = 0

        let resultUsuario = await usuarioController.inserirNovaUsuario(
            administrador,
            contentType
        )

        if (!resultUsuario.status) return resultUsuario

        administrador.id_usuario = resultUsuario.response.usuario.id

        delete administrador.senha
        delete administrador.senha_hash

        let result = await administradorDAO.insertAdministrador(administrador)

        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL

        // envia a senha para o email cadastrado
        let emailEnviado = await enviarSenhaAcesso(
            administrador.email,
            administrador.nome_completo,
            senhaGerada
        )

        if (!emailEnviado) {
            console.log('Administrador criado, mas o email com a senha não foi enviado')
            return message.ERROR_INTERNAL_SERVER_CONTROLLER
        }

        let resultbuscarUsuario = await usuarioController.buscarUsuario(
            administrador.id_usuario
        )

        delete resultbuscarUsuario.response.usuario[0].senha
        delete resultbuscarUsuario.response.usuario[0].senha_hash
        delete administrador.id_usuario

        administrador.id = result
        administrador.usuario = resultbuscarUsuario.response.usuario

        return await montarMensagem(
            message,
            message.SUCESS_CREATED_ITEM,
            administrador
        )

    } catch (error) {
        console.log(error)
    }

    return message.ERROR_INTERNAL_SERVER_CONTROLLER
}

// atualizar administrador
const atualizarAdministrador = async (administrador, id, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDados(administrador, contentType)
        if(validar) return validar // 400 ou 415

        let resultBuscarId = await buscarAdministrador(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        administrador.senha_hash = await bcrypt.criarHash(administrador?.senha)

        // Realiza o upload da imagem do administrador
        if (foto_avatar) {
            let urlImagem = await uploadFiles(foto_avatar)

            if (!urlImagem) {
                return message.ERROR_INTERNAL_SERVER_CONTROLLER
            }

            administrador.foto_avatar = urlImagem
        }

        administrador.id = Number(id)
        let result = await administradorDAO.updateAdministrador(administrador)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        resultBuscarId = await buscarAdministrador(id)
        return resultBuscarId // 200 ou 400 ou 404

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// listar todas administradors
const listarAdministrador = async () => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let result = await administradorDAO.selectAllAdministrador()

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // verfica se o array é vazio
        if(result.length <= 0) return message.ERROR_NOT_FOUND // status_code 404

        for (let administrador of result) {
            let usuario = await usuarioController.buscarUsuario(administrador.id_usuario)

            delete usuario.response.usuario[0].senha
            delete usuario.response.usuario[0].senha_hash

            if (usuario.status) {
                delete usuario.response.usuario[0].id
                Object.assign(administrador, usuario.response.usuario[0])
            }
        }

        let listarAdministradorMessage = await montarMensagem(message, message.SUCESS_RESPONSE, result)
        message.DEFAULT_MESSAGE.response.count = result.length

        return listarAdministradorMessage // status_code 200

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// buscar administrador pelo id
const buscarAdministrador = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

       const validarID = await validarId(id)
       if(validarID) return validarID

        let result = await administradorDAO.selectByIdAdministrador(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        if(result.length < 1) return config_message.ERROR_NOT_FOUND

        for (let administrador of result) {
            let usuario = await usuarioController.buscarUsuario(administrador.id_usuario)

            delete usuario.response.usuario[0].senha
            delete usuario.response.usuario[0].senha_hash

            if (usuario.status) {
                delete usuario.response.usuario[0].id
                Object.assign(administrador, usuario.response.usuario[0])
            }
        }

        return await montarMensagem(message, message.SUCESS_RESPONSE, result)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// excluir administrador pelo id
const excluirAdministrador = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let resultBuscarId = await buscarAdministrador(id)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        let result = await administradorDAO.deleteAdministrador(id)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_DELETE_ITEM)

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const buscarAdministradorByToken = async (token) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let idAdministrador = decodedToken.decode.id

        let resultBuscarId = await buscarAdministrador(idAdministrador)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        return resultBuscarId

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

const editarAdministradorByToken = async (administrador, token, foto_avatar, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        // valida se o usuario deseja editar a senha 
        let resultEditarSenha = false

        let decodedToken = await decodeJWT(token)
        if(!decodedToken.status) return message.ERROR_INVALID_TOKEN

        let idAdministrador = decodedToken.decode.id
        administrador.email = decodedToken.decode.email

        // caso a senha for valida, cria o hash e atualiza a senha do usuario
        if(administrador?.senha != undefined && administrador?.senha != null){
            administrador.senha_hash = await bcrypt.criarHash(administrador.senha)

            resultEditarSenha = await usuarioController.atualizarUsuario(administrador, idAdministrador, contentType)
            if(!resultEditarSenha.status) return resultEditarSenha // 400, 404, 415 ou 500
        }

        // Realiza o upload da imagem do administrador
        if (foto_avatar) {
            let urlImagem = await uploadFiles(foto_avatar)

            if (!urlImagem) {
                return message.ERROR_INTERNAL_SERVER_CONTROLLER
            }

            administrador.foto_avatar = urlImagem
        }

        administrador.id = Number(idAdministrador)
        let result = await administradorDAO.updateAdministrador(administrador)

        if(!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        let resultBuscarId = await buscarAdministrador(idAdministrador)
        if(!resultBuscarId.status) return resultBuscarId // 400 e 404

        delete resultEditarSenha.response.usuario.senha
        delete resultEditarSenha.response.usuario.senha_hash

        // caso a senha não for editada, retorna apenas o administrador editado
        if(resultEditarSenha){
            return await montarMensagem(
                message, 
                message.SUCESS_UPDATE_ITEM,
                resultBuscarId.response.administrador[0]
            )
        }

        return resultBuscarId

    } catch (error) {console.log(error)}
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// troca a senha do administrador logado e marca a senha como definida (senha_provisoria = 0)
const atualizarSenhaAdministradorByToken = async (dados, token, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    try {
        let validar = await validarDadosSenha(dados, contentType)
        if (validar) return validar // 400 ou 415

        let decodedToken = await decodeJWT(token)
        if (!decodedToken.status) return message.ERROR_INVALID_TOKEN // 401

        let idUsuario = decodedToken.decode.id

        // o token traz o id de tbl_usuario; o administrador é localizado pelo id_usuario
        let resultAdministrador = await administradorDAO.selectByIdUsuarioAdministrador(idUsuario)
        if (!resultAdministrador) return message.ERROR_INTERNAL_SERVER_MODEL // 500
        if (resultAdministrador.length < 1) return message.ERROR_NOT_FOUND // 404

        let resultUsuario = await usuarioDAO.selectByIdUsuario(idUsuario)
        if (!resultUsuario) return message.ERROR_INTERNAL_SERVER_MODEL // 500
        if (resultUsuario.length < 1) return message.ERROR_NOT_FOUND // 404

        // confere a senha atual com o hash salvo em tbl_usuario
        let senhaConfere = await bcrypt.validarSenha(dados.senha_atual, resultUsuario[0].senha_hash)
        if (!senhaConfere) {
            message.ERROR_BAD_REQUEST.message = 'Senha atual incorreta.'
            message.ERROR_BAD_REQUEST.field = '[SENHA_ATUAL] INCORRETA'
            return message.ERROR_BAD_REQUEST // 400
        }

        // grava o novo hash em tbl_usuario
        let resultSenha = await usuarioDAO.updateUsuario({
            id: Number(idUsuario),
            senha_hash: await bcrypt.criarHash(dados.nova_senha)
        })
        if (!resultSenha) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        // marca a senha como definida em tbl_administrador
        let result = await administradorDAO.updateSenhaDefinidaAdministrador(resultAdministrador[0].id)
        if (!result) return message.ERROR_INTERNAL_SERVER_MODEL // 500

        return await montarMensagem(message, message.SUCESS_UPDATE_ITEM, { senha_provisoria: 0 })

    } catch (error) { console.log(error) }
    return message.ERROR_INTERNAL_SERVER_CONTROLLER // 500
}

// gera senha aleatória (mínimo 6 caracteres), sem caracteres ambíguos como 0/O e l/1/I


// gera senha aleatória (mínimo 6 caracteres), sem caracteres ambíguos como 0/O e l/1/I
const gerarSenhaAleatoria = (tamanho = 8) => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
    const total = Math.max(Number(tamanho) || 8, 6)
    let senha = ''

    for (let i = 0; i < total; i++) {
        senha += caracteres[crypto.randomInt(caracteres.length)]
    }

    return senha
}

const validarDados = async (administrador, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Valida se o formato de dados é JSON
    // Rejeita requisições com conteúdo incompatível
    if(String(contentType).toLowerCase() != 'application/json' && !String(contentType).toLowerCase().includes('multipart/form-data')) return message.ERROR_CONTENT_TYPE // Status code 415

    // Garante que o administrador foi informado como objeto
    if(administrador == undefined || administrador == null || typeof administrador != 'object'){
        message.ERROR_BAD_REQUEST.field = '[ADMINISTRADOR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida nome completo obrigatório
    if(typeof administrador.nome_completo != 'string' || administrador.nome_completo.trim() == '' || administrador.nome_completo.length > 150){
        message.ERROR_BAD_REQUEST.field = '[NOME_COMPLETO] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Valida e-mail obrigatório
    if(administrador.email == undefined || administrador.email == null || String(administrador.email).trim() == '' || String(administrador.email).length > 150){
        message.ERROR_BAD_REQUEST.field = '[EMAIL] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Valida celular opcional
    if(administrador.celular != undefined && administrador.celular != null &&
       (typeof administrador.celular != 'string' || administrador.celular.length > 20)){
        message.ERROR_BAD_REQUEST.field = '[CELULAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Valida avatar opcional
    if(administrador.foto_avatar != undefined && administrador.foto_avatar != null &&
       typeof administrador.foto_avatar != 'string'){
        message.ERROR_BAD_REQUEST.field = '[FOTO_AVATAR] INVÁLIDO'
        return message.ERROR_BAD_REQUEST
    }

    // Valida nova senha
    if(administrador?.senha != undefined && administrador?.senha != null &&
       (typeof administrador?.senha != 'string' || administrador?.senha.length > 30)){
        message.ERROR_BAD_REQUEST.field = '[senha] INVÁLIDA'
        return message.ERROR_BAD_REQUEST
    }

    return false
}

const validarDadosSenha = async (dados, contentType) => {
    let message = JSON.parse(JSON.stringify(config_message))

    // Rejeita requisições que não sejam JSON
    if(String(contentType).toLowerCase() != 'application/json') return message.ERROR_CONTENT_TYPE // 415

    // Garante que os dados foram informados como objeto
    if(dados == undefined || dados == null || typeof dados != 'object'){
        message.ERROR_BAD_REQUEST.field = '[DADOS] INVÁLIDOS'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a senha atual (mesmo limite do login)
    if(typeof dados.senha_atual != 'string' || dados.senha_atual.trim() == '' || dados.senha_atual.length > 30){
        message.ERROR_BAD_REQUEST.message = 'Informe a senha atual.'
        message.ERROR_BAD_REQUEST.field = '[SENHA_ATUAL] INVÁLIDA'
        return message.ERROR_BAD_REQUEST // 400
    }

    // Valida a nova senha: de 6 a 30 caracteres
    if(typeof dados.nova_senha != 'string' || dados.nova_senha.length < 6 || dados.nova_senha.length > 30){
        message.ERROR_BAD_REQUEST.message = 'A nova senha deve ter de 6 a 30 caracteres.'
        message.ERROR_BAD_REQUEST.field = '[NOVA_SENHA] INVÁLIDA'
        return message.ERROR_BAD_REQUEST // 400
    }

    // A nova senha precisa ser diferente da atual
    if(dados.nova_senha == dados.senha_atual){
        message.ERROR_BAD_REQUEST.message = 'A nova senha deve ser diferente da senha atual.'
        message.ERROR_BAD_REQUEST.field = '[NOVA_SENHA] IGUAL À ATUAL'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const validarId = async (id) => {
    let message = JSON.parse(JSON.stringify(config_message))
    
    // Valida identificador positivo
    if(id == undefined || id == '' || id == null || id <= 0 || isNaN(id)){
        message.ERROR_BAD_REQUEST.field = '[ID] INVÁLIDO'
        return message.ERROR_BAD_REQUEST // 400
    }

    return false
}

const montarMensagem = async (base,status,response = null) => {
    base.DEFAULT_MESSAGE.status = status.status
    base.DEFAULT_MESSAGE.status_code = status.status_code
    base.DEFAULT_MESSAGE.message = status.message

    if(response != null) base.DEFAULT_MESSAGE.response.administrador = response

    return base.DEFAULT_MESSAGE // 200 ou 201
}

module.exports = {
    inserirNovaAdministrador,
    atualizarAdministrador,
    listarAdministrador,
    buscarAdministrador,
    excluirAdministrador,
    buscarAdministradorByToken,
    editarAdministradorByToken,
    atualizarSenhaAdministradorByToken
}
