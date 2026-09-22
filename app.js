/*************************************************************************************
 * Objetivo: Arquivo responsável pela inicialização e configuração da API
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

// executar rodando:
// - npm install
// - npm run dev

require('dotenv').config()

// IMPORT das dependências para criar a API
const express = require('express')
const cors = require('cors')

const app = express()
const port = 8080

const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: ['Content-type', 'Authorization'] 
}

app.use(cors(corsOptions))

const config_message = require('./controller/module/configMessages.js')

// Recebe o token encaminhado nas requisições e solicitar as validações
const verifyJWT = async (req, res, next) => {
    let message = JSON.parse(JSON.stringify(config_message))
    let mensagem = message.ERROR_UNAUTHORIZED
    mensagem.message = "Token inválido."

    // import da biblioteca para validação dos tokens
    const jwt = require('./middleware/middlewareJWT.js')

    // recebe o token encaminhado no header da requisição
    let token = req.headers['x-access-token']

    // valida a autencidade do token
    const autenticidadeToken = await jwt.validateJWT(token)

    // valida se a requisição podera continuar
    if(autenticidadeToken.status) 
        next()
    else
        return res.status(mensagem.status_code).json(mensagem).end()
}

// ******** ROTAS ***********
// Import das rotas
const administradorProfissionalRouter = require('./routes/administrador_profissional.routes.js')
const administradorRouter = require('./routes/administrador.routes.js')
const anotacaoRouter = require('./routes/anotacao.routes.js')
const categoriaRouter = require('./routes/categoria.routes.js')
const categoriaCompartilhadaRouter = require('./routes/categoria_compartilhada.routes.js')
const consultaRouter = require('./routes/consulta.routes.js')
const disponibilidadeRouter = require('./routes/disponibilidade.routes.js')
const especialidadeRouter = require('./routes/especialidade.routes.js')
const horarioTratamentoRouter = require('./routes/horario_tratamento.routes.js')
const notificacaoRouter = require('./routes/notificacao.routes.js')
const opcaoPerguntaRouter = require('./routes/opcao_pergunta.routes.js')
const pacienteRouter = require('./routes/paciente.routes.js')
const perguntaRouter = require('./routes/pergunta.routes.js')
const preferenciaNotificacaoRouter = require('./routes/preferencia_notificacao.routes.js')
const profissionalRouter = require('./routes/profissional.routes.js')
const profissionalEspecialidadeRouter = require('./routes/profissional_especialidade.routes.js')
const registroDoseRouter = require('./routes/registro_dose.routes.js')
const registroHumorRouter = require('./routes/registro_humor.routes.js')
const respostaRouter = require('./routes/resposta.routes.js')
const solicitacaoAcessoRouter = require('./routes/solicitacao_acesso.routes.js')
const tarefaRouter = require('./routes/tarefa.routes.js')
const tarefaDestinatarioRouter = require('./routes/tarefa_destinatario.routes.js')
const tratamentoRouter = require('./routes/tratamento.routes.js')
const vinculoRouter = require('./routes/vinculo.routes.js')
const authRouter = require('./routes/auth.routes.js')

// Rotas da API
app.use('/v1/dialoga/aprovacoes-profissionais', cors(), verifyJWT, administradorProfissionalRouter)
app.use('/v1/dialoga/administradores', cors(), verifyJWT, administradorRouter)
app.use('/v1/dialoga/anotacoes', cors(), verifyJWT, anotacaoRouter)
app.use('/v1/dialoga/categorias', cors(), verifyJWT, categoriaRouter)
app.use('/v1/dialoga/categorias-compartilhadas', cors(), verifyJWT, categoriaCompartilhadaRouter)
app.use('/v1/dialoga/consultas', cors(), verifyJWT, consultaRouter)
app.use('/v1/dialoga/disponibilidades', cors(), verifyJWT, disponibilidadeRouter)
app.use('/v1/dialoga/especialidades', cors(), verifyJWT, especialidadeRouter)
app.use('/v1/dialoga/horarios-tratamento', cors(), verifyJWT, horarioTratamentoRouter)
app.use('/v1/dialoga/notificacoes', cors(), verifyJWT, notificacaoRouter)
app.use('/v1/dialoga/opcoes-pergunta', cors(), verifyJWT, opcaoPerguntaRouter)
app.use('/v1/dialoga/pacientes', cors(), verifyJWT, pacienteRouter)
app.use('/v1/dialoga/perguntas', cors(), verifyJWT, perguntaRouter)
app.use('/v1/dialoga/preferencias-notificacao', cors(), verifyJWT, preferenciaNotificacaoRouter)
app.use('/v1/dialoga/profissionais', cors(), verifyJWT, profissionalRouter)
app.use('/v1/dialoga/profissionais-especialidade', cors(), verifyJWT, profissionalEspecialidadeRouter)
app.use('/v1/dialoga/registros-dose', cors(), verifyJWT, registroDoseRouter)
app.use('/v1/dialoga/registros-humor', cors(), verifyJWT, registroHumorRouter)
app.use('/v1/dialoga/respostas', cors(), verifyJWT, respostaRouter)
app.use('/v1/dialoga/solicitacoes-acesso', cors(), verifyJWT, solicitacaoAcessoRouter)
app.use('/v1/dialoga/tarefas', cors(), verifyJWT, tarefaRouter)
app.use('/v1/dialoga/tarefas-destinatario', cors(), verifyJWT, tarefaDestinatarioRouter)
app.use('/v1/dialoga/tratamentos', cors(), verifyJWT, tratamentoRouter)
app.use('/v1/dialoga/vinculos', cors(), verifyJWT, vinculoRouter)
app.use('/v1/dialoga/auth', cors(), authRouter)

// inicializar a API para receber requisições
app.listen(port, () => {
    console.log(`API rodando em http://localhost:8080`)
})