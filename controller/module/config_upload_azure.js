require('dotenv').config()

module.exports = {
    ACCOUNT:           process.env.AZURE_ACCOUNT,
    CONTAINER_IMAGEM:  process.env.AZURE_CONTAINER_IMAGEM,
    CONTAINER_ARQUIVO: process.env.AZURE_CONTAINER_ARQUIVO,
    TOKEN_IMAGEM:      process.env.AZURE_TOKEN_IMAGEM,
    TOKEN_ARQUIVO:     process.env.AZURE_TOKEN_ARQUIVO
}