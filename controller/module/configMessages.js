/**************************************************************************************
 * Objetivo: Arquivo responsável pela configuração e padronização das mensagens da API
 * Data: 00/10/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 *************************************************************************************/

// Padronização de cabeçalho para retorno dos endpoints da API
const DEFAULT_MESSAGE = {
    "api_description":  "API para gerenciar o controle.",
    "developer"      :  "Julio Augusto.",
    "version"        :  "1.0",
    "status"         :  Boolean,
    "status_code"    :  Number,
    "response"       :  {}
}

// Mensagens de sucesso da API
const SUCESS_CREATED_ITEM = {"status": true, "status_code": 201, "message": "Registro inserido com sucesso!"}

const SUCESS_RESPONSE = {"status": true, "status_code": 200}

const SUCESS_UPDATE_ITEM = {"status": true, "status_code": 200, "message":"Registro atualizado com sucesso!"}

const SUCESS_DELETE_ITEM = {"status": true, "status_code": 200, "message":"Registro apagado com sucesso!"}

const SUCESS_CREATED_ITEM_WARNING = {"status": true, "status_code": 201, "message": "Os dados principais foram inseridos com sucesso, porém alguns dados apresentaram problemas!"}

// Mensagens de erro da API
const ERROR_BAD_REQUEST = { "status": false, "status_code": 400, "message": "Os dados enviados na requisição não estão corretos."}

const ERROR_INTERNAL_SERVER_MODEL = { "status": false, "status_code": 500, "message": "Não foi possivel processar a requisição por conta de erro na API [ERRO NA MODELAGEM DE DADOS]."}

const ERROR_INTERNAL_SERVER_CONTROLLER = { "status": false, "status_code": 500, "message": "Não foi possivel processar a requisição por conta de erro na API [ERRO NA CONTROLLER]."}

const ERROR_CONTENT_TYPE = { "status": false, "status_code": 415, "message": "Não foi possivel processar a requisição, pois o formato de dados aceito pela API é somente JSON."}

const ERROR_NOT_FOUND = { "status": false, "status_code": 404, "message": "Não foi possivel encontrar nenhum registro."}


module.exports = {
    DEFAULT_MESSAGE,
    ERROR_BAD_REQUEST,
    SUCESS_CREATED_ITEM,
    ERROR_INTERNAL_SERVER_MODEL,
    ERROR_INTERNAL_SERVER_CONTROLLER,
    ERROR_CONTENT_TYPE,
    ERROR_NOT_FOUND,
    SUCESS_RESPONSE,
    SUCESS_UPDATE_ITEM,
    SUCESS_DELETE_ITEM,
    SUCESS_CREATED_ITEM_WARNING
}