/**************************************************************************************************
 * Objetivo: Arquivo responsável pela configuração do container para upload de arquivos na azure
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * ************************************************************************************************/

// Criação das constantes de configuração da Azure
const TOKEN     = 'sp=racwl&st=2026-06-10T20:03:51Z&se=2026-06-20T04:18:51Z&sv=2026-02-06&sr=c&sig=qgOA3puLCRvbCU8YU8sxvXuU9ZCEInIB3uXQseA9t9U%3D'
const ACCOUNT   = 'uploadsorvetudos'
const CONTAINER = 'uploadsorvetudos'

module.exports = {
    TOKEN,
    ACCOUNT,
    CONTAINER
}