-- ============================================================
-- INSERTS DE TESTE - db_dialoga
-- Rodar DEPOIS do script_dialoga.sql (os 7 dias da semana já vêm dele).
-- Senha de TODOS os usuários de teste: 123456
-- ============================================================
USE db_dialoga;

-- ------------------------------------------------------------
-- USUARIO (nivel: 0 = administrador, 1 = profissional, 2 = paciente)
-- ids: 1 admin | 2,3,4 profissionais | 5..9 pacientes
-- ------------------------------------------------------------
INSERT INTO tbl_usuario (email, senha_hash, nivel, data_criacao, id_google) VALUES
('admin@dialoga.com',        '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 0, '2026-01-10 09:00:00', NULL),
('ana.psi@dialoga.com',      '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-01-12 10:30:00', NULL),
('carlos.psi@dialoga.com',   '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-02-03 14:15:00', NULL),
('marina.psi@dialoga.com',   '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-09-20 08:45:00', NULL),
('joao.paciente@email.com',  '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-03-01 11:00:00', NULL),
('maria.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-03-05 16:20:00', NULL),
('pedro.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-04-18 09:10:00', NULL),
('lucia.google@gmail.com',   '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-05-22 19:40:00', '108234567890123456789'),
('novo.paciente@email.com',  '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-10-15 13:00:00', NULL);

-- ------------------------------------------------------------
-- ADMINISTRADOR (com e sem campos opcionais)
-- ------------------------------------------------------------
INSERT INTO tbl_administrador (nome_completo, senha_provisoria, celular, foto_avatar, id_usuario) VALUES
('Administrador Dialoga', 0, '(11) 99999-0000', NULL, 1);

-- ------------------------------------------------------------
-- PROFISSIONAL (status: 1 = ativo, 0 = inativo, NULL = aguardando)
-- ------------------------------------------------------------
INSERT INTO tbl_profissional (nome_completo, cpf, crp, celular, instituicao_clinica, foto_avatar, status, id_usuario) VALUES
('Dra. Ana Beatriz Souza',  '12345678901', '06/123456', '(11) 98888-1111', 'Clínica Mente Viva',  'https://exemplo.com/avatar/ana.png', 1,    2),
('Dr. Carlos Henrique Lima','98765432100', '06/654321', '(11) 97777-2222', 'Consultório Particular', NULL,                              1,    3),
('Dra. Marina Duarte',      '11122233344', '06/111222', NULL,              NULL,                  NULL,                                 NULL, 4);

-- ------------------------------------------------------------
-- ESPECIALIDADE e vínculo profissional <-> especialidade (N:N)
-- ------------------------------------------------------------
INSERT INTO tbl_especialidade (especialidade) VALUES
('Psicologia Clínica'),
('Terapia Cognitivo-Comportamental'),
('Neuropsicologia'),
('Psicologia Infantil'),
('Terapia de Casal');

INSERT INTO tbl_profissional_especialidade (id_profissional, id_especialidade) VALUES
(1, 1), (1, 2),          -- Ana: 2 especialidades
(2, 3),                  -- Carlos: 1 especialidade
(3, 4), (3, 5), (3, 1);  -- Marina: 3 especialidades

-- ------------------------------------------------------------
-- ADMINISTRADOR x PROFISSIONAL (aprovação de cadastro)
-- status_aprovacao: 1 = aprovado, 0 = recusado, NULL = pendente
-- ------------------------------------------------------------
INSERT INTO tbl_administrador_profissional (status_aprovacao, data_decisao, criado_em, id_profissional, id_administrador) VALUES
(1,    '2026-01-13 09:00:00', '2026-01-12 10:30:00', 1, 1),  -- aprovado
(1,    '2026-02-04 10:00:00', '2026-02-03 14:15:00', 2, 1),  -- aprovado
(NULL, NULL,                  '2026-09-20 08:45:00', 3, NULL); -- pendente, ainda sem admin responsável

-- ------------------------------------------------------------
-- PACIENTE (primeiro_acesso_concluido: 1 = sim, 0 = não)
-- ------------------------------------------------------------
INSERT INTO tbl_paciente (nome_completo, apelido, data_nascimento, celular, foto_avatar, primeiro_acesso_concluido, status_atividade, id_usuario) VALUES
('João Pedro Almeida',   'João',   '1995-04-12', '(11) 96666-3333', NULL, 1, 'ativo',    5),
('Maria Clara Santos',   'Mari',   '1988-11-30', '(11) 95555-4444', 'avatar_maria.png', 1, 'ativo',    6),
('Pedro Henrique Costa', NULL,     '2001-07-08', NULL,              NULL, 1, 'inativo',  7),
('Lúcia Ferreira',       'Lu',     '1979-02-25', '(11) 94444-5555', NULL, 1, 'ativo',    8),
('Rafael Novaes',        NULL,     NULL,         NULL,              NULL, 0, 'pendente', 9); -- ainda não fez o primeiro acesso

-- ------------------------------------------------------------
-- VINCULO paciente <-> profissional (vários status)
-- ------------------------------------------------------------
INSERT INTO tbl_vinculo (status, origem_cadastro, data_solicitacao, data_aceite, data_inicio_acompanhamento, data_fim, id_profissional, id_paciente) VALUES
('ativo',     'paciente',     '2026-03-02 10:00:00', '2026-03-03 09:00:00', '2026-03-10 14:00:00', NULL,                  1, 1),
('ativo',     'profissional', '2026-03-06 11:00:00', '2026-03-06 15:00:00', '2026-03-12 10:00:00', NULL,                  1, 2),
('encerrado', 'paciente',     '2026-04-19 08:00:00', '2026-04-20 09:30:00', '2026-04-25 16:00:00', '2026-08-30 17:00:00', 2, 3),
('ativo',     'paciente',     '2026-05-23 20:00:00', '2026-05-24 08:00:00', '2026-06-01 09:00:00', NULL,                  2, 4),
('pendente',  'paciente',     '2026-10-16 09:30:00', NULL,                  NULL,                  NULL,                  1, 5),
('recusado',  'paciente',     '2026-10-10 18:00:00', '2026-10-11 10:00:00', NULL,                  '2026-10-11 10:00:00', 2, 5);

-- ------------------------------------------------------------
-- CONSULTA (agendada, realizada, cancelada; criada por paciente/profissional)
-- ------------------------------------------------------------
INSERT INTO tbl_consulta (criado_por, nome_da_conculta, especialidade, data, hora, status, id_vinculo) VALUES
('profissional', 'Sessão semanal - João',      'Psicologia Clínica',               '2026-10-20', '14:00:00', 'agendada',  1),
('paciente',     'Retorno - Maria',            'Terapia Cognitivo-Comportamental', '2026-10-22', '10:30:00', 'agendada',  2),
('profissional', 'Sessão - João',              'Psicologia Clínica',               '2026-10-06', '14:00:00', 'realizada', 1),
('paciente',     'Avaliação neuropsicológica', 'Neuropsicologia',                  '2026-09-15', '09:00:00', 'realizada', 3),
('paciente',     'Sessão - Lúcia',             NULL,                               '2026-10-08', '16:00:00', 'cancelada', 4),
('profissional', 'Sessão - Lúcia',             'Neuropsicologia',                  '2026-10-27', '16:00:00', 'agendada',  4);

-- ------------------------------------------------------------
-- DISPONIBILIDADE + DIAS DA SEMANA (tabela intermediária)
-- ids dos dias: 1 Dom, 2 Seg, 3 Ter, 4 Qua, 5 Qui, 6 Sex, 7 Sáb
-- ------------------------------------------------------------
INSERT INTO tbl_disponibilidade (hora_inicio, hora_fim, tipo_repeticao, data_inicial, data_final, id_profissional) VALUES
('08:00:00', '12:00:00', 'semanal', NULL,         NULL,         1),  -- id 1: manhãs, sempre
('14:00:00', '18:00:00', 'semanal', NULL,         NULL,         1),  -- id 2: tardes
('09:00:00', '13:00:00', 'semanal', NULL,         NULL,         2),  -- id 3
('10:00:00', '15:00:00', 'unica',   '2026-11-07', '2026-11-07',  2),  -- id 4: data única (sábado)
('13:00:00', '19:00:00', 'periodo', '2026-11-01', '2026-12-20',  3);  -- id 5: só num período

INSERT INTO tbl_dias_da_semana_disponibilidade (id_dias_da_semana, id_disponibilidade) VALUES
(2, 1), (4, 1), (6, 1),          -- Ana manhãs: seg, qua, sex
(3, 2), (5, 2),                  -- Ana tardes: ter, qui
(2, 3), (3, 3), (4, 3), (5, 3),  -- Carlos: seg a qui
(7, 4),                          -- Carlos data única: sábado
(2, 5), (6, 5);                  -- Marina: seg e sex no período

-- ------------------------------------------------------------
-- ANOTACAO (com e sem edição)
-- ------------------------------------------------------------
INSERT INTO tbl_anotacao (titulo, conteudo, data_criacao, data_edicao, id_profissional, id_paciente) VALUES
('Primeira sessão', 'Paciente relata dificuldade para dormir e ansiedade no trabalho.', '2026-03-10 15:00:00', NULL,                  1, 1),
('Evolução - abril', 'Melhora no sono após ajustes de rotina. Mantém ansiedade moderada.', '2026-04-14 15:00:00', '2026-04-15 09:00:00', 1, 1),
('Acolhimento',      'Maria demonstra boa adesão. Sugerido registro diário de humor.',     '2026-03-12 11:00:00', NULL,                  1, 2),
('Encerramento',     'Alta do acompanhamento por conclusão dos objetivos.',                '2026-08-30 17:30:00', NULL,                  2, 3);

-- ------------------------------------------------------------
-- SOLICITACAO DE ACESSO a indicadores + categorias compartilhadas
-- ------------------------------------------------------------
INSERT INTO tbl_solicitacao_acesso (status, data_solicitacao, data_resposta, id_profissional, id_paciente) VALUES
('aprovada', '2026-03-15 10:00:00', '2026-03-15 18:00:00', 1, 1),
('parcial',  '2026-03-20 10:00:00', '2026-03-21 08:00:00', 1, 2),
('pendente', '2026-10-17 09:00:00', NULL,                  2, 4),
('recusada', '2026-06-05 14:00:00', '2026-06-06 09:00:00', 2, 4);

INSERT INTO tbl_categoria_compartilhada (categoria, autorizado, id_solicitacao_acesso) VALUES
('humor',      1, 1), ('sono',       1, 1), ('medicacao', 1, 1),
('humor',      1, 2), ('sono',       0, 2), ('medicacao', 0, 2),
('humor',      0, 3), ('sono',       0, 3),
('humor',      0, 4);

-- ------------------------------------------------------------
-- CATEGORIA de notificação, NOTIFICACAO (para profissional ou paciente) e PREFERENCIAS
-- ------------------------------------------------------------
INSERT INTO tbl_categoria (categoria, tipo_especifico) VALUES
('agenda',    'lembrete_consulta'),
('agenda',    'consulta_cancelada'),
('tarefa',    'nova_tarefa'),
('vinculo',   'solicitacao_recebida'),
('medicacao', 'hora_da_dose'),
('sistema',   NULL);

INSERT INTO tbl_notificacao (titulo_mensagem, lida, data_criacao, referencia_evento, id_categoria, id_profissional, id_paciente) VALUES
('Você tem consulta amanhã às 14:00',               0, '2026-10-19 08:00:00', 'consulta:1', 1, NULL, 1),
('Sua consulta de 08/10 foi cancelada',             1, '2026-10-07 12:00:00', 'consulta:5', 2, NULL, 4),
('Nova tarefa disponível: Diário de pensamentos',   0, '2026-10-12 09:00:00', 'tarefa:1',   3, NULL, 1),
('Rafael Novaes solicitou acompanhamento',          0, '2026-10-16 09:30:00', 'vinculo:5',  4, 1,    NULL),
('Hora de tomar Sertralina 50mg',                   1, '2026-10-19 08:00:00', 'dose:1',     5, NULL, 1),
('Bem-vinda ao Dialoga!',                           0, '2026-09-20 08:45:00', NULL,         6, 3,    NULL);

INSERT INTO tbl_preferencia_notificacao (categoria, tipo_especifico, ativo, id_profissional, id_paciente) VALUES
('agenda',    'lembrete_consulta',    1, NULL, 1),
('medicacao', 'hora_da_dose',         1, NULL, 1),
('tarefa',    NULL,                   0, NULL, 2),
('vinculo',   'solicitacao_recebida', 1, 1,    NULL),
('agenda',    NULL,                   1, 2,    NULL);

-- ------------------------------------------------------------
-- TAREFA (criada por profissional ou por paciente; rascunho ou enviada)
-- ------------------------------------------------------------
INSERT INTO tbl_tarefa (titulo, tipo, instrucoes, anexo_arquivo, is_rascunho, data_criacao, data_envio, id_profissional_criador, id_paciente_criador) VALUES
('Diário de pensamentos',     'questionario', 'Preencha ao final de cada dia.',   NULL,               0, '2026-10-10 10:00:00', '2026-10-12 09:00:00', 1,    NULL),
('Escala de ansiedade',       'questionario', 'Responda com sinceridade.',        'escala_gad7.pdf',  0, '2026-10-01 10:00:00', '2026-10-02 08:00:00', 1,    NULL),
('Rotina de sono (rascunho)', 'formulario',   NULL,                               NULL,               1, '2026-10-18 17:00:00', NULL,                  2,    NULL),
('Minhas reflexões da semana','formulario',   'Anotações livres para a sessão.',  NULL,               0, '2026-10-14 20:00:00', '2026-10-14 20:05:00', NULL, 2);

INSERT INTO tbl_pergunta (tipo, texto, imagem, obrigatoria, ordem, id_tarefa) VALUES
('texto',           'Qual situação mais te incomodou hoje?',               NULL,           1, 1, 1),
('multipla_escolha','Como você classificaria seu humor hoje?',             NULL,           1, 2, 1),
('multipla_escolha','Com que frequência se sentiu nervoso(a) nas últimas 2 semanas?', NULL, 1, 1, 2),
('texto',           'Quantas horas você dormiu ontem?',                    NULL,           0, 1, 3),
('texto',           'O que você gostaria de levar para a próxima sessão?', 'reflexao.png', 0, 1, 4);

INSERT INTO tbl_opcao_pergunta (texto, ordem, id_pergunta) VALUES
('Muito mal', 1, 2), ('Mal', 2, 2), ('Neutro', 3, 2), ('Bem', 4, 2), ('Muito bem', 5, 2),
('Nenhuma vez', 1, 3), ('Vários dias', 2, 3), ('Mais da metade dos dias', 3, 3), ('Quase todos os dias', 4, 3);

INSERT INTO tbl_tarefa_destinatario (prazo, status, data_conclusao, id_tarefa, id_paciente) VALUES
('2026-10-20 23:59:00', 'concluida', '2026-10-13 21:00:00', 1, 1),
('2026-10-25 23:59:00', 'pendente',  NULL,                  1, 2),
('2026-10-10 23:59:00', 'atrasada',  NULL,                  2, 2),
(NULL,                  'concluida', '2026-10-14 20:05:00', 4, 2);

INSERT INTO tbl_resposta (valor, data_envio, id_pergunta, id_opcao_pergunta, id_tarefa_destinatario) VALUES
('Uma reunião em que fui cobrado na frente de todos.', '2026-10-13 21:00:00', 1, NULL, 1),  -- resposta de texto
(NULL,                                                  '2026-10-13 21:00:00', 2, 4,    1),  -- resposta por opção ("Bem")
('Quero falar sobre a relação com meu pai.',           '2026-10-14 20:05:00', 5, NULL, 4);

-- ------------------------------------------------------------
-- REGISTRO DE HUMOR (vários dias, com e sem relato)
-- ------------------------------------------------------------
INSERT INTO tbl_registro_humor (data, sentimento, energia, humor, padrao_pensamentos, horas_sono, relato, data_criacao, id_paciente) VALUES
('2026-10-15', 'ansioso',  'baixa', 'ruim',   'preocupação excessiva, catastrofização', 5.50, 'Dormi mal e acordei com o coração acelerado.', '2026-10-15 22:00:00', 1),
('2026-10-16', 'calmo',    'media', 'bom',    'pensamentos neutros',                    7.00, NULL,                                          '2026-10-16 21:30:00', 1),
('2026-10-17', 'animado',  'alta',  'otimo',  'pensamentos positivos',                  8.25, 'Dia ótimo, consegui caminhar de manhã.',      '2026-10-17 20:45:00', 1),
('2026-10-17', 'triste',   'baixa', 'ruim',   'autocrítica, ruminação',                 6.00, 'Me senti sozinha à noite.',                   '2026-10-17 23:00:00', 2),
('2026-10-18', 'irritado', 'media', 'regular','pensamentos acelerados',                 4.75, NULL,                                          '2026-10-18 22:10:00', 4);

-- ------------------------------------------------------------
-- TRATAMENTO / HORARIOS / REGISTRO DE DOSE
-- ------------------------------------------------------------
INSERT INTO tbl_tratamento (nome_medicamento, dosagem, frequencia, lembrete_ativo, id_paciente) VALUES
('Sertralina',  '50 mg', '1x ao dia',  1,    1),
('Clonazepam',  '0,5 mg','2x ao dia',  1,    2),
('Melatonina',  '3 mg',  'à noite',    NULL, 4);

INSERT INTO tbl_horario_tratamento (horario, id_tratamento) VALUES
('08:00:00', 1),
('08:00:00', 2), ('20:00:00', 2),
('22:00:00', 3);

INSERT INTO tbl_registro_dose (data_hora_prevista, status, data_hora_confirmacao, id_horario_tratamento) VALUES
('2026-10-18 08:00:00', 'tomada',    '2026-10-18 08:10:00', 1),
('2026-10-19 08:00:00', 'pendente',  NULL,                  1),
('2026-10-18 08:00:00', 'tomada',    '2026-10-18 08:02:00', 2),
('2026-10-18 20:00:00', 'esquecida', NULL,                  3),
('2026-10-18 22:00:00', 'tomada',    '2026-10-18 22:30:00', 4);