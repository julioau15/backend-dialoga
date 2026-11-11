/*********************************************************************************************************
 * Objetivo: Arquivo responsável pela configuração do upload de arquivos para o container da Azure
 * Autor: Julio Augusto
 * data: 20/09/2026
 * versão: 1.0
 * *******************************************************************************************************/

// Import da dependencia para realizar um requisição http pelo node
const fetch = require('node-fetch').default
const AZURE = require('../module/config_upload_azure')

const EXT_IMAGEM = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

const isImagem = (nome, mimetype) => {
    if (mimetype && mimetype.startsWith('image/')) return true
    const ext = nome.split('.').pop().toLowerCase()
    return EXT_IMAGEM.includes(ext)
}

const uploadFiles = async (input) => {
    const file   = input?.file ?? (input?.buffer ? input : null)
    const imgUrl = input?.body?.img

    let fileName
    let fileBuffer
    let mimetype

    if (file) {
        fileName   = Date.now() + '-' + file.originalname.replace(/\s+/g, '_')
        fileBuffer = file.buffer
        mimetype   = file.mimetype
    } else if (imgUrl) {
        fileName = imgUrl.split('?')[0].split('/').pop()

        const imageResponse = await fetch(imgUrl)
        if (!imageResponse.ok) {
            console.error('Erro ao baixar a imagem da URL fornecida')
            return false
        }
        fileBuffer = await imageResponse.buffer()
        mimetype   = imageResponse.headers.get('content-type')
    } else {
        console.error('Nenhum arquivo ou URL de imagem foi enviado')
        return false
    }

    // Escolhe o container e o token conforme o tipo do arquivo
    const imagem    = isImagem(fileName, mimetype)
    const container = imagem ? AZURE.CONTAINER_IMAGEM : AZURE.CONTAINER_ARQUIVO
    const token     = imagem ? AZURE.TOKEN_IMAGEM     : AZURE.TOKEN_ARQUIVO

    // Sem essas variáveis no .env o upload nunca vai funcionar: avisa o motivo no log
    if (!AZURE.ACCOUNT || !container || !token) {
        console.error('Upload Azure não configurado: confira AZURE_ACCOUNT, AZURE_CONTAINER_* e AZURE_TOKEN_* no .env')
        return false
    }

    const urlFile      = `https://${AZURE.ACCOUNT}.blob.core.windows.net/${container}/${encodeURIComponent(fileName)}`
    const urlFileToken = `${urlFile}?${token}`

    // Erro de rede não pode derrubar a requisição inteira: devolve false e o controller responde
    try {
        const response = await fetch(urlFileToken, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': mimetype || 'application/octet-stream'
            },
            body: fileBuffer
        })

        if (response.status === 201) return urlFile

        // 403 normalmente é token SAS vencido ou sem permissão de escrita
        console.error('Falha no upload para a Azure:', response.status)
    } catch (error) {
        console.error('Falha de conexão no upload para a Azure:', error.code || error.message)
    }

    return false
}

module.exports = { uploadFiles }