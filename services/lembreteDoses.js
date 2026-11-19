/*************************************************************************************
 * Objetivo: Lembrete automático das doses dos tratamentos. A cada minuto procura os horários
 *           que acabaram de vencer (fuso de São Paulo), cria o registro pendente da dose do dia
 *           e envia a notificação "medicacao / hora_da_dose" ao paciente, uma única vez por dose.
 * Observação: no Azure App Service a opção "Always On" precisa estar ligada; sem ela o processo
 *             dorme sem acessos e os lembretes param.
 * *********************************************************************************/

const registroDoseDAO = require('../model/DAO/registro_dose/registro_dose.js')
const notificacaoDAO = require('../model/DAO/notificacao/notificacao.js')
const categoriaDAO = require('../model/DAO/categoria/categoria.js')
const agenda = require('../controller/module/agendaHorarios.js')

const INTERVALO_MS = 60 * 1000   // verifica a cada 1 minuto
const JANELA_MINUTOS = 5         // olha os últimos 5 minutos (cobre atrasos e reinícios do servidor)

let idCategoriaDose = null       // id de tbl_categoria (medicacao / hora_da_dose), buscado uma vez
let executando = false           // evita duas verificações ao mesmo tempo
let temporizador = null          // referência do setInterval (impede iniciar duas vezes)

// Converte minutos do dia (0 a 1439) em 'HH:mm:ss'
const minutosParaHorario = (minutos) => {
    let hora = String(Math.floor(minutos / 60)).padStart(2, '0')
    let minuto = String(minutos % 60).padStart(2, '0')
    return `${hora}:${minuto}:00`
}

// Busca (uma única vez) o id da categoria de notificação usada nos lembretes de dose
const obterIdCategoriaDose = async () => {
    if(idCategoriaDose) return idCategoriaDose

    let result = await categoriaDAO.selectCategoriaByTipo('medicacao', 'hora_da_dose')
    if(result && result.length > 0) idCategoriaDose = result[0].id

    return idCategoriaDose
}

// Procura as doses que venceram na janela de tempo e notifica cada paciente uma única vez por dose
const verificarDoses = async () => {
    if(executando) return
    executando = true

    try {
        let idCategoria = await obterIdCategoriaDose()
        if(!idCategoria){
            console.log('[lembreteDoses] categoria medicacao/hora_da_dose não encontrada em tbl_categoria.')
            return
        }

        // janela [agora - 5 min, agora] no dia atual (não volta para o dia anterior)
        let agora = agenda.agoraNoFuso()
        let [hora, minuto] = agora.hora.split(':').map(Number)
        let minutosAgora = hora * 60 + minuto
        let horaInicio = minutosParaHorario(Math.max(0, minutosAgora - JANELA_MINUTOS))
        let horaFim = minutosParaHorario(minutosAgora)

        let horarios = await registroDoseDAO.selectHorariosParaLembrete(agora.data, horaInicio, horaFim)
        if(!horarios) return

        for(let dose of horarios){
            let dataHoraPrevista = `${agora.data} ${dose.horario}`

            // cria (ou reaproveita) o registro pendente da dose de hoje
            let idRegistro = await registroDoseDAO.insertDosePendente(dose.id_horario_tratamento, dataHoraPrevista)
            if(!idRegistro) continue

            // não envia de novo se o lembrete desta dose já foi criado
            let referenciaEvento = `dose:${idRegistro}`
            let existente = await notificacaoDAO.selectNotificacaoByReferenciaEvento(referenciaEvento, dose.id_paciente)
            if(!existente || existente.length > 0) continue

            await notificacaoDAO.insertNotificacao({
                titulo_mensagem: `Hora de tomar ${dose.nome_medicamento} ${dose.dosagem}`,
                lida: 0,
                referencia_evento: referenciaEvento,
                id_categoria: idCategoria,
                id_profissional: null,
                id_paciente: dose.id_paciente
            })
        }

    } catch (error) { console.log(error) }
    finally { executando = false }
}

// Inicia a verificação periódica (chamada uma vez, quando a API sobe).
// Para desligar (ex.: em testes locais), defina LEMBRETE_DOSES_ATIVO=false no .env
const iniciarLembreteDoses = () => {
    if(process.env.LEMBRETE_DOSES_ATIVO === 'false' || temporizador) return

    verificarDoses()
    temporizador = setInterval(verificarDoses, INTERVALO_MS)
}

module.exports = {
    iniciarLembreteDoses,
    verificarDoses
}
