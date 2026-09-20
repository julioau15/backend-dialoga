/*************************************************************************************
 * Objetivo: Arquivo responsável pela inicialização e configuração da API
 * Data: 20/09/2026
 * Autor: Julio Augusto
 * Versão: 1.0
 * *********************************************************************************/

// executar rodando:
// - npm install
// - npm run dev

// IMPORT das dependências para criar a API
const express = require('express')
const cors = require('cors')

const app = express()
const port = 8080

const corsOptions = {
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: ['Content-type', 'Autorization'] 
}

app.use(cors(corsOptions))

// ******** ROTAS ***********
// Import das rotas
const administradorProfissionalRouter = require('./routes/administrador_profissional.routes.js')
const adminstradorRouter = require('./routes/adminstrador.routes.js')
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

// Rotas da API
app.use('/v1/dialoga/administrador_profissional', cors(), administradorProfissionalRouter)
app.use('/v1/dialoga/adminstrador', cors(), adminstradorRouter)
app.use('/v1/dialoga/anotacao', cors(), anotacaoRouter)
app.use('/v1/dialoga/categoria', cors(), categoriaRouter)
app.use('/v1/dialoga/categoria_compartilhada', cors(), categoriaCompartilhadaRouter)
app.use('/v1/dialoga/consulta', cors(), consultaRouter)
app.use('/v1/dialoga/disponibilidade', cors(), disponibilidadeRouter)
app.use('/v1/dialoga/especialidade', cors(), especialidadeRouter)
app.use('/v1/dialoga/horario_tratamento', cors(), horarioTratamentoRouter)
app.use('/v1/dialoga/notificacao', cors(), notificacaoRouter)
app.use('/v1/dialoga/opcao_pergunta', cors(), opcaoPerguntaRouter)
app.use('/v1/dialoga/paciente', cors(), pacienteRouter)
app.use('/v1/dialoga/pergunta', cors(), perguntaRouter)
app.use('/v1/dialoga/preferencia_notificacao', cors(), preferenciaNotificacaoRouter)
app.use('/v1/dialoga/profissional', cors(), profissionalRouter)
app.use('/v1/dialoga/profissional_especialidade', cors(), profissionalEspecialidadeRouter)
app.use('/v1/dialoga/registro_dose', cors(), registroDoseRouter)
app.use('/v1/dialoga/registro_humor', cors(), registroHumorRouter)
app.use('/v1/dialoga/resposta', cors(), respostaRouter)
app.use('/v1/dialoga/solicitacao_acesso', cors(), solicitacaoAcessoRouter)
app.use('/v1/dialoga/tarefa', cors(), tarefaRouter)
app.use('/v1/dialoga/tarefa_destinatario', cors(), tarefaDestinatarioRouter)
app.use('/v1/dialoga/tratamento', cors(), tratamentoRouter)
app.use('/v1/dialoga/vinculo', cors(), vinculoRouter)

// inicializar a API para receber requisições
app.listen(port, () => {
    console.log(`API rodando em http://localhost:8080`)
})