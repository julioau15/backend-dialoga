/*********************************************************************************************************
 * Objetivo: Arquivo responsável pela configuração do upload de arquivos para o container da Azure
 * Autor: Julio Augusto
 * data: 20/09/2026
 * versão: 1.0
 * *******************************************************************************************************/

// Import da dependencia para realizar um requisição http pelo node
const fetch = require('node-fetch').default

const uploadFiles = async (file) => {
    let fileName;
    let fileBuffer;
    // concatena no nome do arquivo a data e a hora
    if (file.file) {
        fileName = Date.now() + file.file.originalname
        fileBuffer = file.file.buffer; 
    } else {     
        fileName = file.body.img.split('/').pop();
        
        const imageResponse = await fetch(file.body.img);
        
        if (!imageResponse.ok) {
            console.error("Erro ao baixar a imagem da URL fornecida");
            return false;
        }

        // 2. Converte o arquivo baixado em um Buffer
        fileBuffer = await imageResponse.buffer();
    }

    // URL para enviar para o banco de dados
    let urlFile = `https://${AZURE.ACCOUNT}.blob.core.windows.net/${AZURE.CONTAINER}/${fileName}`

    // URL para enviar o arquivo para o container da Azure
    let urlFileToken = `${urlFile}?${AZURE.TOKEN}`

    // faz a requisição
    let response = await fetch(urlFileToken, {
        method: 'PUT',
        headers: {
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type'  : 'application/octet-stream'
        },
        body: fileBuffer
    })

    if(response.status == 201) return urlFile

    return false
}

module.exports = {uploadFiles}