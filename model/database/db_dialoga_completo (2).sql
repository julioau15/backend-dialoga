DROP DATABASE IF EXISTS db_dialoga;
CREATE DATABASE IF NOT EXISTS db_dialoga;
USE db_dialoga;

-- CREATES --
# -------CODIGO VERIFICACAO --------
-- cria tbl_codigo_verificacao
CREATE TABLE tbl_codigo_verificacao (
    id_codigo INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    codigo_hash VARCHAR(255) NOT NULL,
    finalidade VARCHAR(30) NOT NULL,
    data_expiracao DATETIME NOT NULL,
    data_utilizacao DATETIME NULL,
    tentativas INT DEFAULT 0,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_codigo_email (email, finalidade)
);

# ------- USUARIO --------
-- cria tbl_usuario
CREATE TABLE tbl_usuario (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE, -- CORRIGIDO: e-mail de login não pode se repetir
    senha_hash VARCHAR(255) NOT NULL, -- CORRIGIDO: toda conta precisa de senha
    nivel TINYINT NOT NULL,
    data_criacao DATETIME NOT NULL,
    id_google TEXT DEFAULT NULL
);


# ------- ADMINISTRADOR --------
-- cria tbl_administrador
CREATE TABLE tbl_administrador (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    senha_provisoria TINYINT NOT NULL, -- CORRIGIDO: toda conta de admin nasce com uma definição explícita (0/1)
    celular VARCHAR(20) UNIQUE,
    foto_avatar TEXT,
    id_usuario  INT NOT NULL UNIQUE, -- CORRIGIDO: 1 usuário só pode virar 1 administrador
    id_administrador_criador INT NULL, -- quem cadastrou este admin (NULL nos admins iniciais)
    
    CONSTRAINT FK_USUARIO_ADMINISTRADOR
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_ADMINISTRADOR_CRIADOR
    FOREIGN KEY (id_administrador_criador)
    REFERENCES tbl_administrador (id)
    ON DELETE SET NULL
);

# ------- PROFISSIONAL ---------
-- cria tbl_profissional
CREATE TABLE tbl_profissional (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE, -- CORRIGIDO: CPF tem tamanho fixo (CHAR) e não pode se repetir
    crp VARCHAR(20) NOT NULL UNIQUE, -- CORRIGIDO: CRP não pode se repetir
    celular VARCHAR(20) UNIQUE,
    instituicao_clinica VARCHAR(150),
    primeiro_acesso_concluido TINYINT DEFAULT 0,
    foto_avatar TEXT,
    status TINYINT,
    id_usuario  INT NOT NULL UNIQUE, -- CORRIGIDO: 1 usuário só pode virar 1 profissional
    
    CONSTRAINT FK_USUARIO_PROFISSIONAL
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE
);

-- cria tbl_especialidade
CREATE TABLE tbl_especialidade (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	especialidade VARCHAR(100) NOT NULL
);

-- cria tbl_profissional_especialidade
CREATE TABLE tbl_profissional_especialidade (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	id_profissional INT NOT NULL,
    id_especialidade INT NOT NULL,

    CONSTRAINT FK_PROFISSIONAL_PROFISSIONALESPECIALIDADE
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_ESPECIALIDADE_PROFISSIONALESPECIALIDADE
    FOREIGN KEY (id_especialidade)
    REFERENCES tbl_especialidade (id)
    ON DELETE CASCADE
);

-- cria tbl_administrador_profissional
CREATE TABLE tbl_administrador_profissional (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status_aprovacao TINYINT,
    data_decisao DATETIME,
    criado_em DATETIME NOT NULL,
	id_profissional INT NOT NULL,
    id_administrador INT,
    id_admin_responsavel INT NULL, -- divisão fixa: admin que deve decidir a solicitação pendente

    CONSTRAINT FK_ADMINISTRADOR_RESPONSAVEL_APROVACAO
    FOREIGN KEY (id_admin_responsavel)
    REFERENCES tbl_administrador (id)
    ON DELETE SET NULL,

    CONSTRAINT FK_PROFISSIONAL_ADMINISTRADORPROFISSIONAL
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_ADMINISTRADOR_ADMINISTRADORPROFISSIONAL
    FOREIGN KEY (id_administrador)
    REFERENCES tbl_administrador (id)
    ON DELETE SET NULL
);

# ------- PACIENTE --------
-- cria tbl_paciente
CREATE TABLE tbl_paciente (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    apelido VARCHAR(80),
    data_nascimento DATE,
    celular VARCHAR(20) UNIQUE,
    foto_avatar VARCHAR(255),
    primeiro_acesso_concluido TINYINT NOT NULL,
    status_atividade VARCHAR(20) NOT NULL,
    id_usuario  INT NOT NULL UNIQUE,
    
    CONSTRAINT FK_USUARIO_PACIENTE
    FOREIGN KEY (id_usuario)
    REFERENCES tbl_usuario (id)
    ON DELETE CASCADE
);

# ------- VÍNCULO PACIENTE-PROFISSIONAL --------
-- cria tbl_vinculo
CREATE TABLE tbl_vinculo (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    origem_cadastro VARCHAR(20) NOT NULL,
    data_solicitacao DATETIME,
    data_aceite DATETIME,
    data_inicio_acompanhamento DATETIME,
    data_fim DATETIME,
    id_profissional INT NOT NULL,
    id_paciente INT NOT NULL,

    CONSTRAINT FK_PROFISSIONAL_VINCULO
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_PACIENTE_VINCULO
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE CASCADE
);

# ------- AGENDA: CONSULTA E DISPONIBILIDADE --------
-- cria tbl_consulta
CREATE TABLE tbl_consulta (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    criado_por VARCHAR(20) NOT NULL,
    nome_da_consulta VARCHAR(150) NOT NULL,
    especialidade VARCHAR(100),
    data DATE NOT NULL,
    hora TIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    id_vinculo INT NOT NULL,

    CONSTRAINT FK_VINCULO_CONSULTA
    FOREIGN KEY (id_vinculo)
    REFERENCES tbl_vinculo (id)
    ON DELETE CASCADE
);

-- cria tbl_disponibilidade (os dias da semana ficam em tbl_dias_da_semana_disponibilidade)
CREATE TABLE tbl_disponibilidade (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    tipo_repeticao VARCHAR(20) NOT NULL,
    data_inicial DATE,
    data_final DATE,
    id_profissional INT NOT NULL,

    CONSTRAINT FK_PROFISSIONAL_DISPONIBILIDADE
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE NO ACTION
);

-- cria tbl_dias_da_semana (tabela fixa com os 7 dias)
CREATE TABLE tbl_dias_da_semana (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dias_da_semana VARCHAR(17) NOT NULL UNIQUE
);

-- cria tbl_dias_da_semana_disponibilidade (tabela intermediária)
CREATE TABLE tbl_dias_da_semana_disponibilidade (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_dias_da_semana INT NOT NULL,
    id_disponibilidade INT NOT NULL,

    -- a mesma disponibilidade não pode ter o mesmo dia duas vezes
    UNIQUE (id_disponibilidade, id_dias_da_semana),

    CONSTRAINT FK_DIASDASEMANA_DIASDASEMANADISPONIBILIDADE
    FOREIGN KEY (id_dias_da_semana)
    REFERENCES tbl_dias_da_semana (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_DISPONIBILIDADE_DIASDASEMANADISPONIBILIDADE
    FOREIGN KEY (id_disponibilidade)
    REFERENCES tbl_disponibilidade (id)
    ON DELETE CASCADE
);

# ------- ANOTAÇÃO --------
-- cria tbl_anotacao
CREATE TABLE tbl_anotacao (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    conteudo VARCHAR(1000) NOT NULL,
    data_criacao DATETIME NOT NULL,
    data_edicao DATETIME,
    id_profissional INT NOT NULL,
    id_paciente INT NOT NULL,

    CONSTRAINT FK_PROFISSIONAL_ANOTACAO
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE NO ACTION,

    CONSTRAINT FK_PACIENTE_ANOTACAO
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE NO ACTION
);

# ------- SOLICITAÇÃO DE ACESSO A INDICADORES --------
-- cria tbl_solicitacao_acesso
CREATE TABLE tbl_solicitacao_acesso (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(20) NOT NULL,
    data_solicitacao DATETIME NOT NULL,
    data_resposta DATETIME,
    id_profissional INT NOT NULL,
    id_paciente INT NOT NULL,

    CONSTRAINT FK_PROFISSIONAL_SOLICITACAOACESSO
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE NO ACTION,

    CONSTRAINT FK_PACIENTE_SOLICITACAOACESSO
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE NO ACTION
);

-- cria tbl_categoria_compartilhada
CREATE TABLE tbl_categoria_compartilhada (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(30) NOT NULL,
    autorizado TINYINT NOT NULL,
    id_solicitacao_acesso INT NOT NULL,

    CONSTRAINT FK_SOLICITACAOACESSO_CATEGORIACOMPARTILHADA
    FOREIGN KEY (id_solicitacao_acesso)
    REFERENCES tbl_solicitacao_acesso (id)
    ON DELETE CASCADE
);

# ------- NOTIFICAÇÃO --------
-- cria tbl_categoria
CREATE TABLE tbl_categoria (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(20) NOT NULL,
    tipo_especifico VARCHAR(50)
);

-- cria tbl_notificacao
CREATE TABLE tbl_notificacao (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo_mensagem VARCHAR(255) NOT NULL,
    lida TINYINT NOT NULL,
    data_criacao DATETIME NOT NULL,
    referencia_evento VARCHAR(255),
    id_categoria INT NOT NULL,
    id_profissional INT,
    id_paciente INT,

    CONSTRAINT FK_CATEGORIA_NOTIFICACAO
    FOREIGN KEY (id_categoria)
    REFERENCES tbl_categoria (id)
    ON DELETE NO ACTION,

    CONSTRAINT FK_PROFISSIONAL_NOTIFICACAO
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_PACIENTE_NOTIFICACAO
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE CASCADE
);

-- índice usado para não enviar o mesmo lembrete duas vezes (busca por referencia_evento)
CREATE INDEX IDX_NOTIFICACAO_REFERENCIA ON tbl_notificacao (referencia_evento);

-- cria tbl_preferencia_notificacao
CREATE TABLE tbl_preferencia_notificacao (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(30) NOT NULL,
    tipo_especifico VARCHAR(50),
    ativo TINYINT NOT NULL,
    id_profissional INT,
    id_paciente INT,

    CONSTRAINT FK_PROFISSIONAL_PREFERENCIANOTIFICACAO
    FOREIGN KEY (id_profissional)
    REFERENCES tbl_profissional (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_PACIENTE_PREFERENCIANOTIFICACAO
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE CASCADE
);

# ------- TAREFA (FORMULÁRIOS / QUESTIONÁRIOS) --------
-- cria tbl_tarefa
CREATE TABLE tbl_tarefa (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    instrucoes TEXT,
    anexo_arquivo VARCHAR(255),
    is_rascunho TINYINT NOT NULL,
    data_criacao DATETIME NOT NULL,
    data_envio DATETIME,
    id_profissional_criador INT,
    id_paciente_criador INT,

    CONSTRAINT FK_PROFISSIONAL_TAREFA
    FOREIGN KEY (id_profissional_criador)
    REFERENCES tbl_profissional (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_PACIENTE_TAREFA
    FOREIGN KEY (id_paciente_criador)
    REFERENCES tbl_paciente (id)
    ON DELETE CASCADE
);

-- cria tbl_pergunta
CREATE TABLE tbl_pergunta (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL,
    texto TEXT NOT NULL,
    imagem VARCHAR(255),
    obrigatoria TINYINT NOT NULL,
    ordem INT NOT NULL,
    id_tarefa INT NOT NULL,

    CONSTRAINT FK_TAREFA_PERGUNTA
    FOREIGN KEY (id_tarefa)
    REFERENCES tbl_tarefa (id)
    ON DELETE CASCADE
);

-- cria tbl_opcao_pergunta
CREATE TABLE tbl_opcao_pergunta (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    texto VARCHAR(200) NOT NULL,
    ordem INT NOT NULL,
    id_pergunta INT NOT NULL,

    CONSTRAINT FK_PERGUNTA_OPCAOPERGUNTA
    FOREIGN KEY (id_pergunta)
    REFERENCES tbl_pergunta (id)
    ON DELETE CASCADE
);

-- cria tbl_tarefa_destinatario
CREATE TABLE tbl_tarefa_destinatario (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    prazo DATETIME,
    status VARCHAR(20) NOT NULL,
    data_conclusao DATETIME,
    id_tarefa INT NOT NULL,
    id_paciente INT NOT NULL,

    CONSTRAINT FK_TAREFA_TAREFADESTINATARIO
    FOREIGN KEY (id_tarefa)
    REFERENCES tbl_tarefa (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_PACIENTE_TAREFADESTINATARIO
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE CASCADE
);

-- cria tbl_resposta
CREATE TABLE tbl_resposta (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    valor TEXT,
    data_envio DATETIME NOT NULL,
    id_pergunta INT NOT NULL,
    id_opcao_pergunta INT,
    id_tarefa_destinatario INT NOT NULL,

    CONSTRAINT FK_PERGUNTA_RESPOSTA
    FOREIGN KEY (id_pergunta)
    REFERENCES tbl_pergunta (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_OPCAOPERGUNTA_RESPOSTA
    FOREIGN KEY (id_opcao_pergunta)
    REFERENCES tbl_opcao_pergunta (id)
    ON DELETE CASCADE,

    CONSTRAINT FK_TAREFADESTINATARIO_RESPOSTA
    FOREIGN KEY (id_tarefa_destinatario)
    REFERENCES tbl_tarefa_destinatario (id)
    ON DELETE CASCADE
);

# ------- REGISTRO DE HUMOR --------
-- cria tbl_registro_humor
CREATE TABLE tbl_registro_humor (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    sentimento VARCHAR(30) NOT NULL,
    energia VARCHAR(20) NOT NULL,
    humor VARCHAR(20) NOT NULL,
    padrao_pensamentos VARCHAR(500) NOT NULL,
    horas_sono DECIMAL(4,2) NOT NULL,
    relato TEXT,
    data_criacao DATETIME NOT NULL,
    id_paciente INT NOT NULL,

    -- RN10: um registro de humor por paciente por dia
    CONSTRAINT UQ_REGISTROHUMOR_PACIENTE_DATA UNIQUE (id_paciente, data),

    CONSTRAINT FK_PACIENTE_REGISTROHUMOR
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE NO ACTION
);

# ------- TRATAMENTO / MEDICAÇÃO --------
-- cria tbl_tratamento
CREATE TABLE tbl_tratamento (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_medicamento VARCHAR(150) NOT NULL,
    dosagem VARCHAR(150) NOT NULL,
    frequencia VARCHAR(100),
    lembrete_ativo TINYINT,
    id_paciente INT NOT NULL,

    CONSTRAINT FK_PACIENTE_TRATAMENTO
    FOREIGN KEY (id_paciente)
    REFERENCES tbl_paciente (id)
    ON DELETE NO ACTION
);

-- cria tbl_horario_tratamento
CREATE TABLE tbl_horario_tratamento (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    horario TIME NOT NULL,
    id_tratamento INT NOT NULL,

    CONSTRAINT FK_TRATAMENTO_HORARIOTRATAMENTO
    FOREIGN KEY (id_tratamento)
    REFERENCES tbl_tratamento (id)
    ON DELETE CASCADE
);

-- cria tbl_registro_dose
CREATE TABLE tbl_registro_dose (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    data_hora_prevista DATETIME NOT NULL,
    status VARCHAR(25) NOT NULL,
    data_hora_confirmacao DATETIME,
    id_horario_tratamento INT NOT NULL,

    -- uma única dose por horário em cada data/hora prevista (evita duplicidade de confirmação e de lembrete)
    CONSTRAINT UQ_REGISTRODOSE_HORARIO_DATA
    UNIQUE (id_horario_tratamento, data_hora_prevista),

    CONSTRAINT FK_HORARIOTRATAMENTO_REGISTRODOSE
    FOREIGN KEY (id_horario_tratamento)
    REFERENCES tbl_horario_tratamento (id)
    ON DELETE CASCADE
);


-- ========== INSERTS (dados de teste) ==========
USE db_dialoga;

-- ============================================================
-- INSERTS DE TESTE - db_dialoga
-- Rodar DEPOIS do script-creates.sql.
-- Senha de TODOS os usuários de teste: 123456
--
-- Os dados seguem as regras de preenchimento do Dialoga (web, mobile e back):
--   CPF com dígitos verificadores, CRP no formato "CRP 00/00000(0)", celular com DDD
--   válido (11 dígitos, 3º dígito 9), nome com nome e sobrenome, e-mail válido,
--   pelo menos 1 especialidade, consultas dentro da disponibilidade do profissional,
--   opções de humor/tarefa/tratamento iguais às das telas.
--   Datas relativas a 24/11/2026 09:00.
--
-- Resumo:
--   1 administrador
--   20 profissionais: 13 aprovados (ids 1, 2, 4..14), 6 aguardando aprovação
--                     (ids 3, 15..19, só com os dados do cadastro) e 1 reprovado (id 20)
--   20 pacientes: ativos, inativos (3, 16) e pendentes (5, 18, 19, 20);
--                 com e sem solicitação de acesso aos indicadores
-- ============================================================
USE db_dialoga;

-- ------------------------------------------------------------
-- DIAS DA SEMANA (dados fixos)
-- ids: 1 Dom, 2 Seg, 3 Ter, 4 Qua, 5 Qui, 6 Sex, 7 Sáb
-- ------------------------------------------------------------
INSERT INTO tbl_dias_da_semana (dias_da_semana) VALUES
('Domingo'),
('Segunda-feira'),
('Terça-feira'),
('Quarta-feira'),
('Quinta-feira'),
('Sexta-feira'),
('Sábado');


-- ------------------------------------------------------------
-- USUARIO (nivel: 0 = administrador, 1 = profissional, 2 = paciente)
-- ids: 1 admin | 2..21 profissionais 1..20 | 22..41 pacientes 1..20
-- ------------------------------------------------------------
INSERT INTO tbl_usuario (email, senha_hash, nivel, data_criacao, id_google) VALUES
('admin@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 0, '2026-01-10 09:00:00', NULL),
('ana.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-01-12 10:30:00', NULL),
('carlos.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-02-03 14:15:00', NULL),
('marina.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-09-20 08:45:00', NULL),
('bruno.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-02-10 09:00:00', NULL),
('fernanda.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-02-18 14:20:00', NULL),
('gustavo.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-03-02 10:45:00', NULL),
('juliana.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-03-15 16:10:00', NULL),
('ricardo.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-04-01 08:30:00', NULL),
('patricia.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-04-20 11:00:00', NULL),
('camila.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-05-05 13:15:00', NULL),
('thiago.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-05-28 09:40:00', NULL),
('larissa.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-06-14 15:00:00', NULL),
('eduardo.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-07-07 10:00:00', NULL),
('beatriz.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-11-10 17:30:00', NULL),
('sofia.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-11-02 09:20:00', NULL),
('felipe.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-11-08 18:05:00', NULL),
('renata.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-11-15 12:40:00', NULL),
('leonardo.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-11-20 08:10:00', NULL),
('vanessa.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-11-23 21:55:00', NULL),
('marcelo.psi@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 1, '2026-10-05 10:00:00', NULL),
('joao.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-03-01 11:00:00', NULL),
('maria.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-03-05 16:20:00', NULL),
('pedro.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-04-18 09:10:00', NULL),
('lucia.google@gmail.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-05-22 19:40:00', '108234567890123456789'),
('novo.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-10-15 13:00:00', NULL),
('gabriel.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-03-20 10:00:00', NULL),
('isabela.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-04-02 15:30:00', NULL),
('lucas.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-04-11 09:15:00', NULL),
('beatriz.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-05-03 19:00:00', NULL),
('matheus.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-05-19 08:45:00', NULL),
('larissa.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-06-01 14:00:00', NULL),
('felipe.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-06-22 11:20:00', NULL),
('amanda.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-07-08 17:10:00', NULL),
('vinicius.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-07-25 20:30:00', NULL),
('carolina.google@gmail.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-08-03 09:00:00', '108234567890123456790'),
('diego.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-06-10 13:00:00', NULL),
('natalia.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-08-21 16:45:00', NULL),
('bruno.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-11-18 10:30:00', NULL),
('leticia.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-11-21 14:00:00', NULL),
('otavio.paciente@email.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 2, '2026-11-05 18:20:00', NULL);


-- ------------------------------------------------------------
-- ADMINISTRADOR (quantidade mantida: 1)
-- ------------------------------------------------------------
INSERT INTO tbl_administrador (nome_completo, senha_provisoria, celular, foto_avatar, id_usuario) VALUES
('Administrador Dialoga', 0, '(11) 99999-0000', NULL, 1);


-- ------------------------------------------------------------
-- PROFISSIONAL
-- status: 1 = aprovado, NULL = aguardando aprovação, 0 = reprovado
-- Aguardando aprovação: só os dados do cadastro (sem 1º acesso, vínculos, agenda, tarefas...)
-- ------------------------------------------------------------
INSERT INTO tbl_profissional (nome_completo, cpf, crp, celular, instituicao_clinica, primeiro_acesso_concluido, foto_avatar, status, id_usuario) VALUES
('Dra. Ana Beatriz Souza', '52998224725', 'CRP 06/123456', '(11) 98888-1111', 'Clínica Mente Viva', 1, NULL, 1, 2),
('Dr. Carlos Henrique Lima', '16899535009', 'CRP 06/654321', '(11) 97777-2222', 'Consultório Particular', 1, NULL, 1, 3),
('Dra. Marina Duarte', '71460238001', 'CRP 06/111222', '(11) 96543-2100', NULL, 0, NULL, NULL, 4),
('Dr. Bruno Martins Oliveira', '37418596219', 'CRP 06/234567', '(11) 98111-2304', 'Clínica Equilíbrio', 1, NULL, 1, 5),
('Dra. Fernanda Ribeiro Alves', '48372619069', 'CRP 06/34567', '(11) 98222-3405', 'Instituto Bem-Estar', 1, NULL, 1, 6),
('Dr. Gustavo Pereira Nunes', '61528304780', 'CRP 05/45678', '(21) 98333-4506', 'Consultório Particular', 1, NULL, 1, 7),
('Dra. Juliana Castro Mendes', '70291538479', 'CRP 06/567890', '(11) 98444-5607', 'Clínica Mente Viva', 1, NULL, 1, 8),
('Dr. Ricardo Gomes Teixeira', '83614057208', 'CRP 04/67890', '(31) 98555-6708', 'Hospital São Lucas', 1, NULL, 1, 9),
('Dra. Patrícia Moreira Lopes', '92736481500', 'CRP 06/789012', '(11) 98666-7809', 'Espaço Acolher', 1, NULL, 1, 10),
('Dra. Camila Rocha Barbosa', '14059628360', 'CRP 08/89012', '(41) 98777-8910', 'Clínica Renovar', 1, NULL, 1, 11),
('Dr. Thiago Azevedo Pinto', '25180739497', 'CRP 06/901234', '(11) 98888-9011', 'Centro Esportivo Vida', 1, NULL, 1, 12),
('Dra. Larissa Cardoso Freitas', '36291840570', 'CRP 07/12345', '(51) 98999-0112', 'Clínica Equilíbrio', 1, NULL, 1, 13),
('Dr. Eduardo Monteiro Vieira', '47302951616', 'CRP 06/135792', '(11) 97111-1213', 'Consultório Particular', 1, NULL, 1, 14),
('Dra. Beatriz Nogueira Prado', '58413062780', 'CRP 06/246801', '(11) 97222-1314', NULL, 0, NULL, 1, 15),
('Dra. Sofia Carvalho Reis', '69524173891', 'CRP 06/357913', '(11) 97333-1415', 'Clínica Renascer', 0, NULL, NULL, 16),
('Dr. Felipe Andrade Moura', '70635284910', 'CRP 05/46802', '(21) 97444-1516', NULL, 0, NULL, NULL, 17),
('Dra. Renata Batista Cunha', '81746395001', 'CRP 06/579135', '(11) 97555-1617', NULL, 0, NULL, NULL, 18),
('Dr. Leonardo Farias Campos', '92857406185', 'CRP 04/68024', '(31) 97666-1718', 'Instituto Bem-Estar', 0, NULL, NULL, 19),
('Dra. Vanessa Ramos Correia', '13968517202', 'CRP 06/791357', '(11) 97777-1819', NULL, 0, NULL, NULL, 20),
('Dr. Marcelo Tavares Dias', '24079628340', 'CRP 06/802468', '(11) 97888-1920', NULL, 0, NULL, 0, 21);


-- ------------------------------------------------------------
-- ESPECIALIDADE e vínculo profissional <-> especialidade (N:N)
-- todo profissional tem ao menos 1 especialidade (obrigatório no cadastro)
-- ------------------------------------------------------------
INSERT INTO tbl_especialidade (especialidade) VALUES
('Psicologia Clínica'),
('Terapia Cognitivo-Comportamental'),
('Neuropsicologia'),
('Psicologia Infantil'),
('Terapia de Casal'),
('Psicanálise'),
('Psicologia Hospitalar'),
('Terapia Familiar'),
('Psicologia do Esporte'),
('Psicologia Organizacional');

INSERT INTO tbl_profissional_especialidade (id_profissional, id_especialidade) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4),
(3, 5),
(3, 1),
(4, 1),
(4, 2),
(5, 2),
(5, 6),
(6, 3),
(7, 4),
(7, 8),
(8, 7),
(8, 1),
(9, 2),
(9, 5),
(10, 1),
(11, 9),
(11, 2),
(12, 6),
(12, 1),
(13, 3),
(13, 2),
(14, 10),
(15, 1),
(15, 4),
(16, 2),
(17, 8),
(18, 7),
(19, 1),
(19, 6),
(20, 1);


-- ------------------------------------------------------------
-- ADMINISTRADOR x PROFISSIONAL (aprovação de cadastro)
-- status_aprovacao: 1 = aprovado, 0 = reprovado, NULL = pendente
-- pendentes: parte já distribuída ao admin (id_admin_responsavel = 1), parte ainda sem responsável
-- ------------------------------------------------------------
INSERT INTO tbl_administrador_profissional (status_aprovacao, data_decisao, criado_em, id_profissional, id_administrador, id_admin_responsavel) VALUES
(1, '2026-01-13 10:00:00', '2026-01-12 10:30:00', 1, 1, 1),
(1, '2026-02-04 10:00:00', '2026-02-03 14:15:00', 2, 1, 1),
(NULL, NULL, '2026-09-20 08:45:00', 3, NULL, 1),
(1, '2026-02-11 10:00:00', '2026-02-10 09:00:00', 4, 1, 1),
(1, '2026-02-19 10:00:00', '2026-02-18 14:20:00', 5, 1, 1),
(1, '2026-03-03 10:00:00', '2026-03-02 10:45:00', 6, 1, 1),
(1, '2026-03-16 10:00:00', '2026-03-15 16:10:00', 7, 1, 1),
(1, '2026-04-02 10:00:00', '2026-04-01 08:30:00', 8, 1, 1),
(1, '2026-04-21 10:00:00', '2026-04-20 11:00:00', 9, 1, 1),
(1, '2026-05-06 10:00:00', '2026-05-05 13:15:00', 10, 1, 1),
(1, '2026-05-29 10:00:00', '2026-05-28 09:40:00', 11, 1, 1),
(1, '2026-06-15 10:00:00', '2026-06-14 15:00:00', 12, 1, 1),
(1, '2026-07-08 10:00:00', '2026-07-07 10:00:00', 13, 1, 1),
(1, '2026-11-11 10:00:00', '2026-11-10 17:30:00', 14, 1, 1),
(NULL, NULL, '2026-11-02 09:20:00', 15, NULL, 1),
(NULL, NULL, '2026-11-08 18:05:00', 16, NULL, NULL),
(NULL, NULL, '2026-11-15 12:40:00', 17, NULL, 1),
(NULL, NULL, '2026-11-20 08:10:00', 18, NULL, NULL),
(NULL, NULL, '2026-11-23 21:55:00', 19, NULL, 1),
(0, '2026-10-07 15:00:00', '2026-10-05 10:00:00', 20, 1, 1);


-- ------------------------------------------------------------
-- PACIENTE
-- primeiro_acesso_concluido: 1 = já personalizou a experiência (apelido, nascimento, 1º humor), 0 = ainda não
-- ------------------------------------------------------------
INSERT INTO tbl_paciente (nome_completo, apelido, data_nascimento, celular, foto_avatar, primeiro_acesso_concluido, status_atividade, id_usuario) VALUES
('João Pedro Almeida', 'João', '1995-04-12', '(11) 96666-3333', NULL, 1, 'ativo', 22),
('Maria Clara Santos', 'Mari', '1988-11-30', '(11) 95555-4444', NULL, 1, 'ativo', 23),
('Pedro Henrique Costa', NULL, '2001-07-08', '(11) 94321-8765', NULL, 1, 'inativo', 24),
('Lúcia Ferreira', 'Lu', '1979-02-25', '(11) 94444-5555', NULL, 1, 'ativo', 25),
('Rafael Novaes', NULL, NULL, '(11) 93456-7812', NULL, 0, 'pendente', 26),
('Gabriel Souza Lima', 'Gabi', '1998-01-20', '(11) 97222-0606', NULL, 1, 'ativo', 27),
('Isabela Martins Rocha', 'Isa', '1992-06-14', '(11) 97222-0707', NULL, 1, 'ativo', 28),
('Lucas Fernandes Araújo', NULL, '1985-09-03', '(21) 97222-0808', NULL, 1, 'ativo', 29),
('Beatriz Oliveira Cruz', 'Bia', '2000-12-01', '(11) 97222-0909', NULL, 1, 'ativo', 30),
('Matheus Ribeiro Silva', 'Teteu', '1996-03-27', '(21) 97222-1010', NULL, 1, 'ativo', 31),
('Larissa Gomes Pacheco', 'Lari', '1990-08-09', '(11) 97222-1111', NULL, 1, 'ativo', 32),
('Felipe Costa Barros', NULL, '1983-11-17', '(31) 97222-1212', NULL, 1, 'ativo', 33),
('Amanda Duarte Viana', 'Mandy', '1999-05-05', '(11) 97222-1313', NULL, 1, 'ativo', 34),
('Vinícius Santos Moraes', 'Vini', '1994-02-11', '(41) 97222-1414', NULL, 1, 'ativo', 35),
('Carolina Mendes Teixeira', 'Carol', '1987-10-30', '(11) 97222-1515', NULL, 1, 'ativo', 36),
('Diego Almeida Fonseca', NULL, '1979-07-22', '(51) 97222-1616', NULL, 1, 'inativo', 37),
('Natália Pires Carvalho', 'Nati', '2002-04-16', '(11) 97222-1717', NULL, 1, 'ativo', 38),
('Bruno Henrique Sales', NULL, '1997-09-12', '(11) 97222-1818', NULL, 1, 'pendente', 39),
('Letícia Campos Ramos', NULL, NULL, '(11) 97222-1919', NULL, 0, 'pendente', 40),
('Otávio Leal Rezende', 'Tavinho', '1993-01-08', '(11) 97222-2020', NULL, 1, 'pendente', 41);


-- ------------------------------------------------------------
-- VINCULO paciente <-> profissional
-- status: ativo | pendente | recusado | encerrado ; origem_cadastro: quem pediu (paciente | profissional)
-- ------------------------------------------------------------
INSERT INTO tbl_vinculo (status, origem_cadastro, data_solicitacao, data_aceite, data_inicio_acompanhamento, data_fim, id_profissional, id_paciente) VALUES
('ativo', 'paciente', '2026-03-02 10:00:00', '2026-03-03 09:00:00', '2026-03-03 09:00:00', NULL, 1, 1),
('ativo', 'profissional', '2026-03-06 11:00:00', '2026-03-06 15:00:00', '2026-03-06 15:00:00', NULL, 1, 2),
('encerrado', 'paciente', '2026-04-19 08:00:00', '2026-04-20 09:30:00', '2026-04-20 09:30:00', '2026-08-30 17:00:00', 2, 3),
('ativo', 'paciente', '2026-05-23 20:00:00', '2026-05-24 08:00:00', '2026-05-24 08:00:00', NULL, 2, 4),
('pendente', 'paciente', '2026-10-16 09:30:00', NULL, NULL, NULL, 1, 5),
('recusado', 'paciente', '2026-10-15 18:00:00', NULL, NULL, NULL, 2, 5),
('ativo', 'profissional', '2026-03-21 09:00:00', '2026-03-21 12:00:00', '2026-03-21 12:00:00', NULL, 4, 6),
('ativo', 'paciente', '2026-04-03 08:00:00', '2026-04-03 14:00:00', '2026-04-03 14:00:00', NULL, 4, 7),
('ativo', 'paciente', '2026-04-12 10:00:00', '2026-04-13 09:00:00', '2026-04-13 09:00:00', NULL, 5, 8),
('ativo', 'profissional', '2026-05-04 11:00:00', '2026-05-04 18:00:00', '2026-05-04 18:00:00', NULL, 5, 9),
('ativo', 'paciente', '2026-07-01 09:00:00', '2026-07-02 10:00:00', '2026-07-02 10:00:00', NULL, 6, 9),
('ativo', 'paciente', '2026-05-20 09:00:00', '2026-05-20 16:00:00', '2026-05-20 16:00:00', NULL, 6, 10),
('ativo', 'profissional', '2026-06-02 10:00:00', '2026-06-02 19:00:00', '2026-06-02 19:00:00', NULL, 7, 11),
('ativo', 'paciente', '2026-06-23 08:30:00', '2026-06-24 09:00:00', '2026-06-24 09:00:00', NULL, 8, 12),
('ativo', 'paciente', '2026-07-09 12:00:00', '2026-07-09 17:00:00', '2026-07-09 17:00:00', NULL, 9, 13),
('ativo', 'profissional', '2026-07-26 10:00:00', '2026-07-26 21:00:00', '2026-07-26 21:00:00', NULL, 10, 14),
('ativo', 'paciente', '2026-08-04 09:00:00', '2026-08-04 15:00:00', '2026-08-04 15:00:00', NULL, 11, 15),
('encerrado', 'paciente', '2026-06-16 09:00:00', '2026-06-16 13:00:00', '2026-06-16 13:00:00', '2026-10-30 18:00:00', 12, 16),
('ativo', 'paciente', '2026-08-22 10:00:00', '2026-08-23 09:00:00', '2026-08-23 09:00:00', NULL, 12, 17),
('ativo', 'profissional', '2026-09-10 14:00:00', '2026-09-10 20:00:00', '2026-09-10 20:00:00', NULL, 13, 17),
('pendente', 'paciente', '2026-11-18 10:45:00', NULL, NULL, NULL, 13, 18),
('pendente', 'profissional', '2026-11-21 14:30:00', NULL, NULL, NULL, 7, 19),
('recusado', 'paciente', '2026-11-06 09:00:00', NULL, NULL, NULL, 8, 20),
('ativo', 'paciente', '2026-09-01 09:00:00', '2026-09-01 18:00:00', '2026-09-01 18:00:00', NULL, 4, 1);


-- ------------------------------------------------------------
-- DISPONIBILIDADE + DIAS DA SEMANA (tabela intermediária)
-- tipo_repeticao: semanal | unica (só na data_inicial) | periodo (entre data_inicial e data_final)
-- profissionais aguardando aprovação não têm agenda (não conseguem entrar no sistema)
-- ------------------------------------------------------------
INSERT INTO tbl_disponibilidade (hora_inicio, hora_fim, tipo_repeticao, data_inicial, data_final, id_profissional) VALUES
('08:00:00', '12:00:00', 'semanal', NULL, NULL, 1),
('14:00:00', '18:00:00', 'semanal', NULL, NULL, 1),
('09:00:00', '13:00:00', 'semanal', NULL, NULL, 2),
('10:00:00', '15:00:00', 'unica', '2026-11-07', '2026-11-07', 2),
('08:00:00', '12:00:00', 'semanal', NULL, NULL, 4),
('13:00:00', '19:00:00', 'semanal', NULL, NULL, 5),
('09:00:00', '12:00:00', 'unica', '2026-12-05', '2026-12-05', 5),
('07:30:00', '11:30:00', 'semanal', NULL, NULL, 6),
('14:00:00', '20:00:00', 'semanal', NULL, NULL, 7),
('08:00:00', '17:00:00', 'periodo', '2026-06-01', '2027-01-31', 8),
('09:00:00', '13:00:00', 'semanal', NULL, NULL, 9),
('18:00:00', '21:00:00', 'semanal', NULL, NULL, 9),
('10:00:00', '16:00:00', 'semanal', NULL, NULL, 10),
('06:30:00', '10:30:00', 'semanal', NULL, NULL, 11),
('08:00:00', '12:00:00', 'unica', '2026-12-12', '2026-12-12', 11),
('13:00:00', '18:00:00', 'semanal', NULL, NULL, 12),
('08:00:00', '12:00:00', 'semanal', NULL, NULL, 13),
('14:00:00', '18:00:00', 'semanal', NULL, NULL, 13);

INSERT INTO tbl_dias_da_semana_disponibilidade (id_dias_da_semana, id_disponibilidade) VALUES
(2, 1),
(4, 1),
(6, 1),
(3, 2),
(5, 2),
(2, 3),
(3, 3),
(4, 3),
(5, 3),
(7, 4),
(2, 5),
(3, 5),
(4, 5),
(2, 6),
(4, 6),
(6, 6),
(7, 7),
(3, 8),
(5, 8),
(2, 9),
(3, 9),
(4, 9),
(5, 9),
(6, 9),
(2, 10),
(4, 10),
(3, 11),
(6, 11),
(2, 12),
(4, 12),
(2, 13),
(3, 13),
(2, 14),
(4, 14),
(6, 14),
(7, 15),
(3, 16),
(5, 16),
(2, 17),
(3, 17),
(4, 17),
(5, 17),
(6, 18);


-- ------------------------------------------------------------
-- CONSULTA
-- status: agendada | cancelada (o back não grava outro status; consultas passadas ficam 'agendada')
-- todas dentro da disponibilidade do profissional, sem horário sobreposto e com especialidade do profissional
-- ------------------------------------------------------------
INSERT INTO tbl_consulta (criado_por, nome_da_consulta, especialidade, data, hora, status, id_vinculo) VALUES
('profissional', 'Sessão semanal - João', 'Psicologia Clínica', '2026-10-20', '14:00:00', 'agendada', 1),
('paciente', 'Retorno - Maria', 'Terapia Cognitivo-Comportamental', '2026-10-22', '15:00:00', 'agendada', 2),
('profissional', 'Sessão - João', 'Psicologia Clínica', '2026-10-06', '14:00:00', 'agendada', 1),
('paciente', 'Avaliação neuropsicológica', 'Neuropsicologia', '2026-08-25', '09:00:00', 'agendada', 3),
('paciente', 'Sessão - Lúcia', 'Neuropsicologia', '2026-10-08', '11:00:00', 'cancelada', 4),
('profissional', 'Sessão - Lúcia', 'Neuropsicologia', '2026-10-27', '11:00:00', 'agendada', 4),
('profissional', 'Sessão - João', 'Psicologia Clínica', '2026-11-03', '14:00:00', 'agendada', 1),
('profissional', 'Sessão semanal - João', 'Psicologia Clínica', '2026-11-25', '08:30:00', 'agendada', 1),
('paciente', 'Retorno - João', 'Psicologia Clínica', '2026-11-10', '15:00:00', 'cancelada', 1),
('profissional', 'Sessão - Mari', 'Psicologia Clínica', '2026-11-04', '08:30:00', 'agendada', 2),
('paciente', 'Sessão semanal - Mari', 'Psicologia Clínica', '2026-11-26', '15:00:00', 'agendada', 2),
('profissional', 'Sessão - Lu', 'Neuropsicologia', '2026-11-05', '10:00:00', 'agendada', 4),
('profissional', 'Sessão semanal - Lu', 'Neuropsicologia', '2026-11-30', '10:30:00', 'agendada', 4),
('profissional', 'Sessão - Gabi', 'Psicologia Clínica', '2026-11-09', '09:30:00', 'agendada', 7),
('paciente', 'Sessão semanal - Gabi', 'Psicologia Clínica', '2026-11-30', '10:00:00', 'agendada', 7),
('paciente', 'Retorno - Gabi', 'Psicologia Clínica', '2026-11-16', '10:30:00', 'cancelada', 7),
('profissional', 'Sessão - Isa', 'Psicologia Clínica', '2026-11-09', '08:00:00', 'agendada', 8),
('profissional', 'Sessão semanal - Isa', 'Psicologia Clínica', '2026-11-30', '08:30:00', 'agendada', 8),
('profissional', 'Sessão - Lucas', 'Terapia Cognitivo-Comportamental', '2026-11-09', '15:30:00', 'agendada', 9),
('paciente', 'Sessão semanal - Lucas', 'Terapia Cognitivo-Comportamental', '2026-11-30', '16:00:00', 'agendada', 9),
('profissional', 'Sessão - Bia', 'Terapia Cognitivo-Comportamental', '2026-11-09', '17:30:00', 'agendada', 10),
('profissional', 'Sessão semanal - Bia', 'Terapia Cognitivo-Comportamental', '2026-12-02', '16:30:00', 'agendada', 10),
('paciente', 'Retorno - Bia', 'Terapia Cognitivo-Comportamental', '2026-11-16', '17:00:00', 'cancelada', 10),
('profissional', 'Sessão - Bia', 'Neuropsicologia', '2026-11-10', '07:30:00', 'agendada', 11),
('paciente', 'Sessão semanal - Bia', 'Neuropsicologia', '2026-12-03', '08:00:00', 'agendada', 11),
('profissional', 'Sessão - Teteu', 'Neuropsicologia', '2026-11-12', '08:00:00', 'agendada', 12),
('profissional', 'Sessão semanal - Teteu', 'Neuropsicologia', '2026-12-03', '09:30:00', 'agendada', 12),
('profissional', 'Sessão - Lari', 'Psicologia Infantil', '2026-11-12', '18:30:00', 'agendada', 13),
('paciente', 'Sessão semanal - Lari', 'Psicologia Infantil', '2026-12-04', '19:00:00', 'agendada', 13),
('paciente', 'Retorno - Lari', 'Psicologia Infantil', '2026-11-12', '15:30:00', 'cancelada', 13),
('profissional', 'Sessão - Felipe', 'Psicologia Hospitalar', '2026-11-16', '13:00:00', 'agendada', 14),
('profissional', 'Sessão semanal - Felipe', 'Psicologia Hospitalar', '2026-11-25', '13:30:00', 'agendada', 14),
('profissional', 'Sessão - Mandy', 'Terapia Cognitivo-Comportamental', '2026-11-16', '18:30:00', 'agendada', 15),
('paciente', 'Sessão semanal - Mandy', 'Terapia Cognitivo-Comportamental', '2026-11-27', '11:30:00', 'agendada', 15),
('profissional', 'Sessão - Vini', 'Psicologia Clínica', '2026-11-03', '10:30:00', 'agendada', 16),
('profissional', 'Sessão semanal - Vini', 'Psicologia Clínica', '2026-11-30', '11:00:00', 'agendada', 16),
('paciente', 'Retorno - Vini', 'Psicologia Clínica', '2026-11-16', '11:30:00', 'cancelada', 16),
('profissional', 'Sessão - Carol', 'Psicologia do Esporte', '2026-11-04', '09:30:00', 'agendada', 17),
('paciente', 'Sessão semanal - Carol', 'Psicologia do Esporte', '2026-11-30', '06:30:00', 'agendada', 17),
('profissional', 'Sessão - Nati', 'Psicanálise', '2026-11-05', '15:30:00', 'agendada', 19),
('profissional', 'Sessão semanal - Nati', 'Psicanálise', '2026-12-01', '16:00:00', 'agendada', 19),
('profissional', 'Sessão - Nati', 'Neuropsicologia', '2026-11-06', '14:30:00', 'agendada', 20),
('paciente', 'Sessão semanal - Nati', 'Neuropsicologia', '2026-11-30', '09:00:00', 'agendada', 20),
('paciente', 'Retorno - Nati', 'Neuropsicologia', '2026-11-11', '09:30:00', 'cancelada', 20),
('profissional', 'Sessão - João', 'Psicologia Clínica', '2026-11-09', '10:30:00', 'agendada', 24),
('profissional', 'Sessão semanal - João', 'Psicologia Clínica', '2026-12-01', '09:30:00', 'agendada', 24);


-- ------------------------------------------------------------
-- ANOTACAO (com e sem edição)
-- ------------------------------------------------------------
INSERT INTO tbl_anotacao (titulo, conteudo, data_criacao, data_edicao, id_profissional, id_paciente) VALUES
('Primeira sessão', 'Paciente relata dificuldade para dormir e ansiedade no trabalho.', '2026-03-10 15:00:00', NULL, 1, 1),
('Evolução - abril', 'Melhora no sono após ajustes de rotina. Mantém ansiedade moderada.', '2026-04-14 15:00:00', '2026-04-15 09:00:00', 1, 1),
('Acolhimento', 'Maria demonstra boa adesão. Sugerido registro diário de humor.', '2026-03-12 11:00:00', NULL, 1, 2),
('Encerramento', 'Alta do acompanhamento por conclusão dos objetivos.', '2026-08-30 17:30:00', NULL, 2, 3),
('Primeira sessão', 'Paciente chega com queixa de ansiedade generalizada. Combinado registro diário de humor.', '2026-03-28 16:00:00', NULL, 4, 6),
('Evolução', 'Relata melhora na qualidade do sono e menos episódios de irritabilidade.', '2026-11-02 17:30:00', '2026-11-03 09:00:00', 4, 6),
('Evolução', 'Relata melhora na qualidade do sono e menos episódios de irritabilidade.', '2026-04-10 16:00:00', NULL, 4, 7),
('Plano terapêutico', 'Definidos objetivos: reduzir ruminação noturna e retomar atividade física.', '2026-04-20 16:00:00', NULL, 5, 8),
('Sessão difícil', 'Paciente emocionado ao falar sobre luto recente. Acolhimento e validação.', '2026-11-04 17:30:00', NULL, 5, 8),
('Sessão difícil', 'Paciente emocionado ao falar sobre luto recente. Acolhimento e validação.', '2026-05-11 16:00:00', NULL, 5, 9),
('Tarefa de casa', 'Orientado a preencher o diário de pensamentos antes da próxima sessão.', '2026-07-09 16:00:00', NULL, 6, 9),
('Revisão mensal', 'Boa adesão às tarefas. Mantém acompanhamento psiquiátrico em paralelo.', '2026-11-06 17:30:00', '2026-11-07 09:00:00', 6, 9),
('Revisão mensal', 'Boa adesão às tarefas. Mantém acompanhamento psiquiátrico em paralelo.', '2026-05-27 16:00:00', NULL, 6, 10),
('Primeira sessão', 'Paciente chega com queixa de ansiedade generalizada. Combinado registro diário de humor.', '2026-06-09 16:00:00', NULL, 7, 11),
('Evolução', 'Relata melhora na qualidade do sono e menos episódios de irritabilidade.', '2026-11-08 17:30:00', NULL, 7, 11),
('Evolução', 'Relata melhora na qualidade do sono e menos episódios de irritabilidade.', '2026-07-01 16:00:00', NULL, 8, 12),
('Plano terapêutico', 'Definidos objetivos: reduzir ruminação noturna e retomar atividade física.', '2026-07-16 16:00:00', NULL, 9, 13),
('Sessão difícil', 'Paciente emocionado ao falar sobre luto recente. Acolhimento e validação.', '2026-11-10 17:30:00', '2026-11-11 09:00:00', 9, 13),
('Sessão difícil', 'Paciente emocionado ao falar sobre luto recente. Acolhimento e validação.', '2026-08-02 16:00:00', NULL, 10, 14),
('Tarefa de casa', 'Orientado a preencher o diário de pensamentos antes da próxima sessão.', '2026-08-11 16:00:00', NULL, 11, 15),
('Revisão mensal', 'Boa adesão às tarefas. Mantém acompanhamento psiquiátrico em paralelo.', '2026-11-12 17:30:00', NULL, 11, 15),
('Revisão mensal', 'Boa adesão às tarefas. Mantém acompanhamento psiquiátrico em paralelo.', '2026-08-30 16:00:00', NULL, 12, 17),
('Primeira sessão', 'Paciente chega com queixa de ansiedade generalizada. Combinado registro diário de humor.', '2026-09-17 16:00:00', NULL, 13, 17),
('Evolução', 'Relata melhora na qualidade do sono e menos episódios de irritabilidade.', '2026-11-14 17:30:00', '2026-11-15 09:00:00', 13, 17),
('Evolução', 'Relata melhora na qualidade do sono e menos episódios de irritabilidade.', '2026-09-08 16:00:00', NULL, 4, 1),
('Plano terapêutico', 'Definidos objetivos: reduzir ruminação noturna e retomar atividade física.', '2026-06-23 16:00:00', NULL, 12, 16),
('Sessão difícil', 'Paciente emocionado ao falar sobre luto recente. Acolhimento e validação.', '2026-10-18 17:30:00', NULL, 12, 16),
('Encerramento', 'Encerramento do acompanhamento a pedido do paciente (mudança de cidade).', '2026-10-30 18:30:00', NULL, 12, 16);


-- ------------------------------------------------------------
-- SOLICITACAO DE ACESSO a indicadores + categorias compartilhadas
-- status: pendente | aprovada | reprovada (só existe com vínculo ativo)
-- categoria_compartilhada: o app grava apenas as categorias autorizadas pelo paciente
-- pacientes sem nenhuma solicitação: 3, 5, 14, 16, 18, 19 e 20
-- ------------------------------------------------------------
INSERT INTO tbl_solicitacao_acesso (status, data_solicitacao, data_resposta, id_profissional, id_paciente) VALUES
('aprovada', '2026-03-15 10:00:00', '2026-03-15 18:00:00', 1, 1),
('aprovada', '2026-03-20 10:00:00', '2026-03-21 08:00:00', 1, 2),
('pendente', '2026-10-17 09:00:00', NULL, 2, 4),
('reprovada', '2026-06-05 14:00:00', '2026-06-06 09:00:00', 2, 4),
('aprovada', '2026-04-01 10:00:00', '2026-04-01 20:00:00', 4, 6),
('aprovada', '2026-04-15 09:00:00', '2026-04-16 08:00:00', 4, 7),
('pendente', '2026-11-20 11:00:00', NULL, 5, 8),
('reprovada', '2026-05-15 14:00:00', '2026-05-16 10:00:00', 5, 9),
('aprovada', '2026-07-12 10:00:00', '2026-07-12 22:00:00', 6, 9),
('pendente', '2026-11-22 15:30:00', NULL, 6, 10),
('aprovada', '2026-06-12 09:00:00', '2026-06-12 19:00:00', 7, 11),
('aprovada', '2026-07-05 10:00:00', '2026-07-06 09:30:00', 8, 12),
('pendente', '2026-11-23 09:00:00', NULL, 9, 13),
('aprovada', '2026-08-15 10:00:00', '2026-08-15 21:00:00', 11, 15),
('aprovada', '2026-09-02 10:00:00', '2026-09-02 18:00:00', 12, 17),
('reprovada', '2026-09-20 10:00:00', '2026-09-21 08:00:00', 13, 17),
('pendente', '2026-11-24 08:00:00', NULL, 4, 1);

INSERT INTO tbl_categoria_compartilhada (categoria, autorizado, id_solicitacao_acesso) VALUES
('Humor', 1, 1),
('Horas de sono', 1, 1),
('Tratamentos', 1, 1),
('Humor', 1, 2),
('Sentimento', 1, 5),
('Energia', 1, 5),
('Humor', 1, 5),
('Pensamentos', 1, 5),
('Horas de sono', 1, 5),
('Acontecimentos', 1, 5),
('Tratamentos', 1, 5),
('Sentimento', 1, 6),
('Humor', 1, 6),
('Horas de sono', 1, 6),
('Humor', 1, 9),
('Energia', 1, 9),
('Tratamentos', 1, 9),
('Sentimento', 1, 11),
('Energia', 1, 11),
('Humor', 1, 11),
('Pensamentos', 1, 11),
('Horas de sono', 1, 11),
('Acontecimentos', 1, 11),
('Tratamentos', 1, 11),
('Humor', 1, 12),
('Pensamentos', 1, 12),
('Acontecimentos', 1, 12),
('Sentimento', 1, 14),
('Humor', 1, 14),
('Horas de sono', 1, 14),
('Tratamentos', 1, 14),
('Sentimento', 1, 15),
('Energia', 1, 15),
('Humor', 1, 15),
('Pensamentos', 1, 15),
('Horas de sono', 1, 15),
('Acontecimentos', 1, 15),
('Tratamentos', 1, 15);


-- ------------------------------------------------------------
-- TAREFA (questionários do profissional e autotarefas do paciente)
-- tbl_tarefa.tipo: formulario | autotarefa ; tbl_pergunta.tipo: unica | multipla | paragrafo | emocoes | escala
-- tbl_tarefa_destinatario.status: pendente | concluida (o 'atrasada' é calculado pelo prazo nas telas)
-- respostas: unica/multipla -> id_opcao_pergunta ; paragrafo -> texto ; emocoes -> mal | neutro | bem ; escala -> 0..10
-- ------------------------------------------------------------
INSERT INTO tbl_tarefa (titulo, tipo, instrucoes, anexo_arquivo, is_rascunho, data_criacao, data_envio, id_profissional_criador, id_paciente_criador) VALUES
('Diário de pensamentos', 'formulario', 'Preencha ao final de cada dia.', NULL, 0, '2026-10-10 10:00:00', '2026-10-12 09:00:00', 1, NULL),
('Escala de ansiedade', 'formulario', 'Responda com sinceridade.', NULL, 0, '2026-10-01 10:00:00', '2026-10-02 08:00:00', 1, NULL),
('Rotina de sono', 'formulario', NULL, NULL, 1, '2026-10-18 17:00:00', NULL, 2, NULL),
('Minhas reflexões da semana', 'autotarefa', NULL, NULL, 0, '2026-10-14 20:00:00', '2026-10-14 20:00:00', NULL, 2),
('Registro de gratidão', 'formulario', 'Liste três coisas boas do seu dia.', NULL, 0, '2026-11-01 10:00:00', '2026-11-01 10:05:00', 4, NULL),
('Inventário de ansiedade (GAD-7)', 'formulario', 'Considere as últimas duas semanas.', NULL, 0, '2026-11-03 09:00:00', '2026-11-03 09:10:00', 5, NULL),
('Mapa da rotina', 'formulario', 'Descreva um dia típico da sua semana.', NULL, 0, '2026-11-05 14:00:00', '2026-11-05 14:00:00', 6, NULL),
('Diário do sono', 'formulario', 'Responda logo ao acordar.', NULL, 0, '2026-11-10 08:00:00', '2026-11-10 08:30:00', 7, NULL),
('Registro de pensamentos automáticos', 'formulario', 'Use o modelo situação, pensamento e emoção.', NULL, 0, '2026-11-12 11:00:00', '2026-11-12 11:00:00', 8, NULL),
('Metas da semana', 'formulario', NULL, NULL, 0, '2026-11-16 10:00:00', '2026-11-16 10:00:00', 9, NULL),
('Check-in pós-treino', 'formulario', 'Responda após cada treino.', NULL, 0, '2026-11-18 07:00:00', '2026-11-18 07:00:00', 11, NULL),
('Linha do tempo de vida', 'formulario', 'Marque os eventos mais marcantes.', NULL, 1, '2026-11-22 16:00:00', NULL, 12, NULL),
('Escala de humor semanal', 'formulario', NULL, NULL, 0, '2026-11-20 09:00:00', '2026-11-20 09:00:00', 13, NULL),
('Levar preocupações para a sessão', 'autotarefa', NULL, NULL, 0, '2026-11-19 21:00:00', '2026-11-19 21:00:00', NULL, 11),
('Caminhar 20 minutos', 'autotarefa', NULL, NULL, 0, '2026-11-20 07:30:00', '2026-11-20 07:30:00', NULL, 14);

INSERT INTO tbl_pergunta (tipo, texto, imagem, obrigatoria, ordem, id_tarefa) VALUES
('paragrafo', 'Qual situação mais te incomodou hoje?', NULL, 1, 1, 1),
('unica', 'Como você classificaria seu humor hoje?', NULL, 1, 2, 1),
('unica', 'Com que frequência se sentiu nervoso(a) nas últimas 2 semanas?', NULL, 1, 1, 2),
('paragrafo', 'Quantas horas você dormiu ontem?', NULL, 0, 1, 3),
('paragrafo', 'Quais foram as três coisas boas de hoje?', NULL, 1, 1, 5),
('emocoes', 'Como você se sentiu ao fazer o exercício?', NULL, 0, 2, 5),
('unica', 'Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)', NULL, 1, 1, 6),
('unica', 'Não ser capaz de impedir ou controlar as preocupações', NULL, 1, 2, 6),
('escala', 'De 0 a 10, quanto a ansiedade atrapalhou sua rotina?', NULL, 1, 3, 6),
('paragrafo', 'Que horas você costuma acordar e dormir?', NULL, 1, 1, 7),
('multipla', 'Quais atividades te dão mais energia?', NULL, 0, 2, 7),
('escala', 'De 0 a 10, como foi a qualidade do seu sono?', NULL, 1, 1, 8),
('unica', 'Acordou durante a noite?', NULL, 1, 2, 8),
('paragrafo', 'Descreva a situação.', NULL, 1, 1, 9),
('paragrafo', 'Qual pensamento passou pela sua cabeça?', NULL, 1, 2, 9),
('unica', 'Qual a intensidade da emoção?', NULL, 1, 3, 9),
('paragrafo', 'Qual meta você quer cumprir nesta semana?', NULL, 1, 1, 10),
('emocoes', 'Como você se sentiu depois do treino?', NULL, 1, 1, 11),
('escala', 'De 0 a 10, qual era sua motivação?', NULL, 1, 2, 11),
('paragrafo', 'Qual o evento mais marcante da sua infância?', NULL, 0, 1, 12),
('unica', 'Como foi seu humor na maior parte da semana?', NULL, 1, 1, 13);

INSERT INTO tbl_opcao_pergunta (texto, ordem, id_pergunta) VALUES
('Muito mal', 1, 2),
('Mal', 2, 2),
('Neutro', 3, 2),
('Bem', 4, 2),
('Muito bem', 5, 2),
('Nenhuma vez', 1, 3),
('Vários dias', 2, 3),
('Mais da metade dos dias', 3, 3),
('Quase todos os dias', 4, 3),
('Nenhuma vez', 1, 7),
('Vários dias', 2, 7),
('Mais da metade dos dias', 3, 7),
('Quase todos os dias', 4, 7),
('Nenhuma vez', 1, 8),
('Vários dias', 2, 8),
('Mais da metade dos dias', 3, 8),
('Quase todos os dias', 4, 8),
('Exercício físico', 1, 11),
('Estar com amigos', 2, 11),
('Cozinhar', 3, 11),
('Ler', 4, 11),
('Ouvir música', 5, 11),
('Sim', 1, 13),
('Não', 2, 13),
('Não lembro', 3, 13),
('Leve', 1, 16),
('Moderada', 2, 16),
('Forte', 3, 16),
('Muito mal', 1, 21),
('Mal', 2, 21),
('Neutro', 3, 21),
('Bem', 4, 21),
('Muito bem', 5, 21);

INSERT INTO tbl_tarefa_destinatario (prazo, status, data_conclusao, id_tarefa, id_paciente) VALUES
('2026-10-20 23:59:00', 'concluida', '2026-10-13 21:00:00', 1, 1),
('2026-10-25 23:59:00', 'pendente', NULL, 1, 2),
('2026-10-10 23:59:00', 'pendente', NULL, 2, 2),
('2026-10-16 23:59:00', 'concluida', '2026-10-14 20:05:00', 4, 2),
('2026-11-08 23:59:00', 'concluida', '2026-11-05 21:30:00', 5, 6),
('2026-11-08 23:59:00', 'pendente', NULL, 5, 7),
('2026-11-30 23:59:00', 'pendente', NULL, 5, 1),
('2026-11-10 23:59:00', 'concluida', '2026-11-09 20:00:00', 6, 8),
('2026-11-28 23:59:00', 'pendente', NULL, 6, 9),
('2026-11-15 23:59:00', 'concluida', '2026-11-12 22:15:00', 7, 9),
('2026-11-15 23:59:00', 'concluida', '2026-11-14 19:40:00', 7, 10),
('2026-11-30 23:59:00', 'pendente', NULL, 8, 11),
('2026-11-19 23:59:00', 'concluida', '2026-11-18 23:00:00', 9, 12),
('2026-11-23 23:59:00', 'pendente', NULL, 10, 13),
('2026-12-01 23:59:00', 'concluida', '2026-11-19 09:10:00', 11, 15),
('2026-11-27 23:59:00', 'pendente', NULL, 13, 17),
('2026-11-26 23:59:00', 'pendente', NULL, 14, 11),
('2026-11-22 23:59:00', 'concluida', '2026-11-21 18:40:00', 15, 14);

INSERT INTO tbl_resposta (valor, data_envio, id_pergunta, id_opcao_pergunta, id_tarefa_destinatario) VALUES
('Uma reunião em que fui cobrado na frente de todos.', '2026-10-13 21:00:00', 1, NULL, 1),
(NULL, '2026-10-13 21:00:00', 2, 4, 1),
('Um café com amigos, terminar um projeto e dormir cedo.', '2026-11-05 21:30:00', 5, NULL, 5),
('bem', '2026-11-05 21:30:00', 6, NULL, 5),
(NULL, '2026-11-09 20:00:00', 7, 11, 8),
(NULL, '2026-11-09 20:00:00', 8, 16, 8),
('6', '2026-11-09 20:00:00', 9, NULL, 8),
('Acordo às 6h30 e durmo por volta da meia-noite.', '2026-11-12 22:15:00', 10, NULL, 10),
(NULL, '2026-11-12 22:15:00', 11, 18, 10),
(NULL, '2026-11-12 22:15:00', 11, 20, 10),
('Acordo às 9h e durmo às 2h.', '2026-11-14 19:40:00', 10, NULL, 11),
('Discussão no trabalho.', '2026-11-18 23:00:00', 14, NULL, 13),
('Ninguém me respeita.', '2026-11-18 23:00:00', 15, NULL, 13),
(NULL, '2026-11-18 23:00:00', 16, 28, 13),
('bem', '2026-11-19 09:10:00', 18, NULL, 15),
('8', '2026-11-19 09:10:00', 19, NULL, 15);


-- ------------------------------------------------------------
-- REGISTRO DE HUMOR (um por paciente por dia)
-- sentimento: Feliz | Triste | Ansioso | Irritado | Calmo | Cansado ; energia: Baixa | Média | Alta
-- humor: Muito mal | Mal | Neutro | Bem | Muito bem ; padrao_pensamentos: Positivos | Negativos | Neutros ; horas_sono: 0 a 24
-- ------------------------------------------------------------
INSERT INTO tbl_registro_humor (data, sentimento, energia, humor, padrao_pensamentos, horas_sono, relato, data_criacao, id_paciente) VALUES
('2026-10-15', 'Ansioso', 'Baixa', 'Mal', 'Negativos', 5.5, 'Dormi mal e acordei com o coração acelerado.', '2026-10-15 22:00:00', 1),
('2026-10-16', 'Calmo', 'Média', 'Bem', 'Neutros', 7.0, NULL, '2026-10-16 21:30:00', 1),
('2026-10-17', 'Feliz', 'Alta', 'Muito bem', 'Positivos', 8.25, 'Dia ótimo, consegui caminhar de manhã.', '2026-10-17 20:45:00', 1),
('2026-10-17', 'Triste', 'Baixa', 'Mal', 'Negativos', 6.0, 'Me senti sozinha à noite.', '2026-10-17 23:00:00', 2),
('2026-10-18', 'Irritado', 'Média', 'Neutro', 'Negativos', 4.75, NULL, '2026-10-18 22:10:00', 4),
('2026-11-17', 'Cansado', 'Alta', 'Muito mal', 'Neutros', 8.0, 'Consegui sair para caminhar.', '2026-11-17 22:42:00', 6),
('2026-11-18', 'Feliz', 'Baixa', 'Neutro', 'Positivos', 7.0, NULL, '2026-11-18 20:42:00', 6),
('2026-11-19', 'Triste', 'Média', 'Muito bem', 'Negativos', 6.0, 'Discuti com um familiar.', '2026-11-19 21:42:00', 6),
('2026-11-20', 'Ansioso', 'Alta', 'Mal', 'Neutros', 5.0, 'Dormi bem e acordei disposto(a).', '2026-11-20 22:42:00', 6),
('2026-11-21', 'Irritado', 'Baixa', 'Bem', 'Positivos', 8.0, NULL, '2026-11-21 20:42:00', 6),
('2026-11-22', 'Calmo', 'Média', 'Muito mal', 'Negativos', 7.0, 'Dia corrido no trabalho.', '2026-11-22 21:42:00', 6),
('2026-11-23', 'Cansado', 'Alta', 'Neutro', 'Neutros', 6.0, NULL, '2026-11-23 22:42:00', 6),
('2026-11-17', 'Ansioso', 'Baixa', 'Mal', 'Positivos', 8.5, NULL, '2026-11-17 22:49:00', 7),
('2026-11-18', 'Irritado', 'Média', 'Bem', 'Negativos', 8.0, 'Discuti com um familiar.', '2026-11-18 20:49:00', 7),
('2026-11-19', 'Calmo', 'Alta', 'Muito mal', 'Neutros', 7.5, 'Dormi bem e acordei disposto(a).', '2026-11-19 21:49:00', 7),
('2026-11-20', 'Cansado', 'Baixa', 'Neutro', 'Positivos', 7.0, NULL, '2026-11-20 22:49:00', 7),
('2026-11-21', 'Feliz', 'Média', 'Muito bem', 'Negativos', 6.5, 'Dia corrido no trabalho.', '2026-11-21 20:49:00', 7),
('2026-11-22', 'Triste', 'Alta', 'Mal', 'Neutros', 6.0, NULL, '2026-11-22 21:49:00', 7),
('2026-11-17', 'Cansado', 'Média', 'Neutro', 'Negativos', 5.0, 'Discuti com um familiar.', '2026-11-17 22:56:00', 8),
('2026-11-18', 'Feliz', 'Alta', 'Muito bem', 'Neutros', 5.0, 'Dormi bem e acordei disposto(a).', '2026-11-18 20:56:00', 8),
('2026-11-19', 'Triste', 'Baixa', 'Mal', 'Positivos', 5.0, NULL, '2026-11-19 21:56:00', 8),
('2026-11-20', 'Ansioso', 'Média', 'Bem', 'Negativos', 5.0, 'Dia corrido no trabalho.', '2026-11-20 22:56:00', 8),
('2026-11-21', 'Irritado', 'Alta', 'Muito mal', 'Neutros', 5.0, NULL, '2026-11-21 20:56:00', 8),
('2026-11-17', 'Ansioso', 'Alta', 'Bem', 'Neutros', 5.5, 'Dormi bem e acordei disposto(a).', '2026-11-17 22:03:00', 9),
('2026-11-18', 'Irritado', 'Baixa', 'Muito mal', 'Positivos', 6.0, NULL, '2026-11-18 20:03:00', 9),
('2026-11-19', 'Calmo', 'Média', 'Neutro', 'Negativos', 6.5, 'Dia corrido no trabalho.', '2026-11-19 21:03:00', 9),
('2026-11-20', 'Cansado', 'Alta', 'Muito bem', 'Neutros', 7.0, NULL, '2026-11-20 22:03:00', 9),
('2026-11-21', 'Feliz', 'Baixa', 'Mal', 'Positivos', 7.5, 'Consegui sair para caminhar.', '2026-11-21 20:03:00', 9),
('2026-11-22', 'Triste', 'Média', 'Bem', 'Negativos', 8.0, NULL, '2026-11-22 21:03:00', 9),
('2026-11-23', 'Ansioso', 'Alta', 'Muito mal', 'Neutros', 8.5, 'Discuti com um familiar.', '2026-11-23 22:03:00', 9),
('2026-11-17', 'Cansado', 'Baixa', 'Muito bem', 'Positivos', 6.0, NULL, '2026-11-17 22:10:00', 10),
('2026-11-18', 'Feliz', 'Média', 'Mal', 'Negativos', 7.0, 'Dia corrido no trabalho.', '2026-11-18 20:10:00', 10),
('2026-11-19', 'Triste', 'Alta', 'Bem', 'Neutros', 8.0, NULL, '2026-11-19 21:10:00', 10),
('2026-11-20', 'Ansioso', 'Baixa', 'Muito mal', 'Positivos', 5.0, 'Consegui sair para caminhar.', '2026-11-20 22:10:00', 10),
('2026-11-21', 'Irritado', 'Média', 'Neutro', 'Negativos', 6.0, NULL, '2026-11-21 20:10:00', 10),
('2026-11-22', 'Calmo', 'Alta', 'Muito bem', 'Neutros', 7.0, 'Discuti com um familiar.', '2026-11-22 21:10:00', 10),
('2026-11-17', 'Ansioso', 'Média', 'Muito mal', 'Negativos', 6.5, 'Dia corrido no trabalho.', '2026-11-17 22:17:00', 11),
('2026-11-18', 'Irritado', 'Alta', 'Neutro', 'Neutros', 8.0, NULL, '2026-11-18 20:17:00', 11),
('2026-11-19', 'Calmo', 'Baixa', 'Muito bem', 'Positivos', 5.5, 'Consegui sair para caminhar.', '2026-11-19 21:17:00', 11),
('2026-11-20', 'Cansado', 'Média', 'Mal', 'Negativos', 7.0, NULL, '2026-11-20 22:17:00', 11),
('2026-11-21', 'Feliz', 'Alta', 'Bem', 'Neutros', 8.5, 'Discuti com um familiar.', '2026-11-21 20:17:00', 11),
('2026-11-17', 'Cansado', 'Alta', 'Mal', 'Neutros', 7.0, NULL, '2026-11-17 22:24:00', 12),
('2026-11-18', 'Feliz', 'Baixa', 'Bem', 'Positivos', 5.0, 'Consegui sair para caminhar.', '2026-11-18 20:24:00', 12),
('2026-11-19', 'Triste', 'Média', 'Muito mal', 'Negativos', 7.0, NULL, '2026-11-19 21:24:00', 12),
('2026-11-20', 'Ansioso', 'Alta', 'Neutro', 'Neutros', 5.0, 'Discuti com um familiar.', '2026-11-20 22:24:00', 12),
('2026-11-21', 'Irritado', 'Baixa', 'Muito bem', 'Positivos', 7.0, 'Dormi bem e acordei disposto(a).', '2026-11-21 20:24:00', 12),
('2026-11-22', 'Calmo', 'Média', 'Mal', 'Negativos', 5.0, NULL, '2026-11-22 21:24:00', 12),
('2026-11-23', 'Cansado', 'Alta', 'Bem', 'Neutros', 7.0, 'Dia corrido no trabalho.', '2026-11-23 22:24:00', 12),
('2026-11-17', 'Ansioso', 'Baixa', 'Neutro', 'Positivos', 7.5, 'Consegui sair para caminhar.', '2026-11-17 22:31:00', 13),
('2026-11-18', 'Irritado', 'Média', 'Muito bem', 'Negativos', 6.0, NULL, '2026-11-18 20:31:00', 13),
('2026-11-19', 'Calmo', 'Alta', 'Mal', 'Neutros', 8.5, 'Discuti com um familiar.', '2026-11-19 21:31:00', 13),
('2026-11-20', 'Cansado', 'Baixa', 'Bem', 'Positivos', 7.0, 'Dormi bem e acordei disposto(a).', '2026-11-20 22:31:00', 13),
('2026-11-21', 'Feliz', 'Média', 'Muito mal', 'Negativos', 5.5, NULL, '2026-11-21 20:31:00', 13),
('2026-11-22', 'Triste', 'Alta', 'Neutro', 'Neutros', 8.0, 'Dia corrido no trabalho.', '2026-11-22 21:31:00', 13),
('2026-11-17', 'Cansado', 'Média', 'Bem', 'Negativos', 8.0, NULL, '2026-11-17 22:38:00', 14),
('2026-11-18', 'Feliz', 'Alta', 'Muito mal', 'Neutros', 7.0, 'Discuti com um familiar.', '2026-11-18 20:38:00', 14),
('2026-11-19', 'Triste', 'Baixa', 'Neutro', 'Positivos', 6.0, 'Dormi bem e acordei disposto(a).', '2026-11-19 21:38:00', 14),
('2026-11-20', 'Ansioso', 'Média', 'Muito bem', 'Negativos', 5.0, NULL, '2026-11-20 22:38:00', 14),
('2026-11-21', 'Irritado', 'Alta', 'Mal', 'Neutros', 8.0, 'Dia corrido no trabalho.', '2026-11-21 20:38:00', 14),
('2026-11-17', 'Ansioso', 'Alta', 'Muito bem', 'Neutros', 8.5, 'Discuti com um familiar.', '2026-11-17 22:45:00', 15),
('2026-11-18', 'Irritado', 'Baixa', 'Mal', 'Positivos', 8.0, 'Dormi bem e acordei disposto(a).', '2026-11-18 20:45:00', 15),
('2026-11-19', 'Calmo', 'Média', 'Bem', 'Negativos', 7.5, NULL, '2026-11-19 21:45:00', 15),
('2026-11-20', 'Cansado', 'Alta', 'Muito mal', 'Neutros', 7.0, 'Dia corrido no trabalho.', '2026-11-20 22:45:00', 15),
('2026-11-21', 'Feliz', 'Baixa', 'Neutro', 'Positivos', 6.5, NULL, '2026-11-21 20:45:00', 15),
('2026-11-22', 'Triste', 'Média', 'Muito bem', 'Negativos', 6.0, 'Consegui sair para caminhar.', '2026-11-22 21:45:00', 15),
('2026-11-23', 'Ansioso', 'Alta', 'Mal', 'Neutros', 5.5, NULL, '2026-11-23 22:45:00', 15),
('2026-11-17', 'Ansioso', 'Média', 'Mal', 'Negativos', 5.5, NULL, '2026-11-17 22:59:00', 17),
('2026-11-18', 'Irritado', 'Alta', 'Bem', 'Neutros', 6.0, 'Dia corrido no trabalho.', '2026-11-18 20:59:00', 17),
('2026-11-19', 'Calmo', 'Baixa', 'Muito mal', 'Positivos', 6.5, NULL, '2026-11-19 21:59:00', 17),
('2026-11-20', 'Cansado', 'Média', 'Neutro', 'Negativos', 7.0, 'Consegui sair para caminhar.', '2026-11-20 22:59:00', 17),
('2026-11-21', 'Feliz', 'Alta', 'Muito bem', 'Neutros', 7.5, NULL, '2026-11-21 20:59:00', 17),
('2026-11-01', 'Triste', 'Média', 'Neutro', 'Negativos', 5.5, NULL, '2026-11-01 22:00:00', 1),
('2026-11-02', 'Ansioso', 'Alta', 'Muito bem', 'Neutros', 6.0, 'Consegui sair para caminhar.', '2026-11-02 22:00:00', 1),
('2026-11-03', 'Irritado', 'Baixa', 'Mal', 'Positivos', 6.5, NULL, '2026-11-03 22:00:00', 1),
('2026-11-04', 'Calmo', 'Média', 'Bem', 'Negativos', 7.0, 'Discuti com um familiar.', '2026-11-04 22:00:00', 1),
('2026-11-05', 'Cansado', 'Alta', 'Muito mal', 'Neutros', 7.5, 'Dormi bem e acordei disposto(a).', '2026-11-05 22:00:00', 1),
('2026-11-06', 'Feliz', 'Baixa', 'Neutro', 'Positivos', 5.0, NULL, '2026-11-06 22:00:00', 1),
('2026-11-07', 'Triste', 'Média', 'Muito bem', 'Negativos', 5.5, 'Dia corrido no trabalho.', '2026-11-07 22:00:00', 1),
('2026-11-08', 'Ansioso', 'Alta', 'Mal', 'Neutros', 6.0, NULL, '2026-11-08 22:00:00', 1),
('2026-11-09', 'Irritado', 'Baixa', 'Bem', 'Positivos', 6.5, 'Consegui sair para caminhar.', '2026-11-09 22:00:00', 1),
('2026-11-10', 'Calmo', 'Média', 'Muito mal', 'Negativos', 7.0, NULL, '2026-11-10 22:00:00', 1),
('2026-11-11', 'Cansado', 'Alta', 'Neutro', 'Neutros', 7.5, 'Discuti com um familiar.', '2026-11-11 22:00:00', 1),
('2026-11-12', 'Feliz', 'Baixa', 'Muito bem', 'Positivos', 5.0, 'Dormi bem e acordei disposto(a).', '2026-11-12 22:00:00', 1),
('2026-11-13', 'Triste', 'Média', 'Mal', 'Negativos', 5.5, NULL, '2026-11-13 22:00:00', 1),
('2026-11-14', 'Ansioso', 'Alta', 'Bem', 'Neutros', 6.0, 'Dia corrido no trabalho.', '2026-11-14 22:00:00', 1);


-- ------------------------------------------------------------
-- TRATAMENTO / HORARIOS / REGISTRO DE DOSE
-- frequencia: Uma | Duas | Três | Quatro vezes ao dia (nº de horários = frequência)
-- registro_dose.status: pendente | tomada (o 'atrasada' é calculado na tela); só tratamentos com lembrete ativo geram dose
-- ------------------------------------------------------------
INSERT INTO tbl_tratamento (nome_medicamento, dosagem, frequencia, lembrete_ativo, id_paciente) VALUES
('Sertralina', '50 mg', 'Uma vez ao dia', 1, 1),
('Clonazepam', '0,5 mg', 'Duas vezes ao dia', 1, 2),
('Melatonina', '3 mg', 'Uma vez ao dia', 0, 4),
('Escitalopram', '10 mg', 'Uma vez ao dia', 1, 6),
('Fluoxetina', '20 mg', 'Uma vez ao dia', 1, 7),
('Quetiapina', '25 mg', 'Uma vez ao dia', 1, 9),
('Bupropiona', '150 mg', 'Duas vezes ao dia', 1, 9),
('Venlafaxina', '75 mg', 'Uma vez ao dia', 0, 11),
('Carbonato de lítio', '300 mg', 'Três vezes ao dia', 1, 13),
('Melatonina', '5 mg', 'Uma vez ao dia', 0, 15),
('Sertralina', '100 mg', 'Uma vez ao dia', 1, 17),
('Alprazolam', '0,25 mg', 'Uma vez ao dia', 0, 12);

INSERT INTO tbl_horario_tratamento (horario, id_tratamento) VALUES
('08:00:00', 1),
('08:00:00', 2),
('20:00:00', 2),
('22:00:00', 3),
('08:00:00', 4),
('07:30:00', 5),
('22:00:00', 6),
('08:00:00', 7),
('14:00:00', 7),
('09:00:00', 8),
('08:00:00', 9),
('14:00:00', 9),
('20:00:00', 9),
('23:00:00', 10),
('08:30:00', 11),
('21:00:00', 12);

INSERT INTO tbl_registro_dose (data_hora_prevista, status, data_hora_confirmacao, id_horario_tratamento) VALUES
('2026-11-22 08:00:00', 'tomada', '2026-11-22 08:04:00', 1),
('2026-11-23 08:00:00', 'tomada', '2026-11-23 08:04:00', 1),
('2026-11-24 08:00:00', 'pendente', NULL, 1),
('2026-11-22 08:00:00', 'tomada', '2026-11-22 08:05:00', 2),
('2026-11-23 08:00:00', 'pendente', NULL, 2),
('2026-11-24 08:00:00', 'tomada', '2026-11-24 08:05:00', 2),
('2026-11-22 20:00:00', 'pendente', NULL, 3),
('2026-11-23 20:00:00', 'tomada', '2026-11-23 20:06:00', 3),
('2026-11-22 08:00:00', 'tomada', '2026-11-22 08:08:00', 5),
('2026-11-23 08:00:00', 'tomada', '2026-11-23 08:08:00', 5),
('2026-11-24 08:00:00', 'tomada', '2026-11-24 08:08:00', 5),
('2026-11-22 07:30:00', 'tomada', '2026-11-22 07:39:00', 6),
('2026-11-23 07:30:00', 'tomada', '2026-11-23 07:39:00', 6),
('2026-11-24 07:30:00', 'pendente', NULL, 6),
('2026-11-22 22:00:00', 'tomada', '2026-11-22 22:10:00', 7),
('2026-11-23 22:00:00', 'pendente', NULL, 7),
('2026-11-22 08:00:00', 'pendente', NULL, 8),
('2026-11-23 08:00:00', 'tomada', '2026-11-23 08:11:00', 8),
('2026-11-24 08:00:00', 'tomada', '2026-11-24 08:11:00', 8),
('2026-11-22 14:00:00', 'tomada', '2026-11-22 14:12:00', 9),
('2026-11-23 14:00:00', 'tomada', '2026-11-23 14:12:00', 9),
('2026-11-22 08:00:00', 'tomada', '2026-11-22 08:14:00', 11),
('2026-11-23 08:00:00', 'tomada', '2026-11-23 08:14:00', 11),
('2026-11-24 08:00:00', 'pendente', NULL, 11),
('2026-11-22 14:00:00', 'tomada', '2026-11-22 14:15:00', 12),
('2026-11-23 14:00:00', 'pendente', NULL, 12),
('2026-11-22 20:00:00', 'pendente', NULL, 13),
('2026-11-23 20:00:00', 'tomada', '2026-11-23 20:16:00', 13),
('2026-11-22 08:30:00', 'tomada', '2026-11-22 08:48:00', 15),
('2026-11-23 08:30:00', 'tomada', '2026-11-23 08:48:00', 15),
('2026-11-24 08:30:00', 'pendente', NULL, 15);


-- ------------------------------------------------------------
-- CATEGORIA de notificação, PREFERENCIAS e NOTIFICACAO
-- preferências: categorias/tipos da tela de configurações (paciente: tarefa, medicacao, agenda; profissional: agenda, tarefa, paciente; "todas" = desligar todas)
-- notificações: mesmos textos e referências gerados pelo back, sempre para UM destinatário (profissional OU paciente)
-- ------------------------------------------------------------
INSERT INTO tbl_categoria (categoria, tipo_especifico) VALUES
('agenda', 'lembrete_consulta'),
('agenda', 'consulta_cancelada'),
('tarefa', 'nova_tarefa'),
('vinculo', 'solicitacao_recebida'),
('medicacao', 'hora_da_dose'),
('sistema', NULL),
('agenda', 'nova_consulta'),
('agenda', 'lembrete_atendimento'),
('agenda', 'lembrete_vespera');

INSERT INTO tbl_preferencia_notificacao (categoria, tipo_especifico, ativo, id_profissional, id_paciente) VALUES
('agenda', 'lembrete_consulta', 1, NULL, 1),
('medicacao', 'hora_da_dose', 1, NULL, 1),
('tarefa', 'nova_tarefa', 0, NULL, 2),
('paciente', 'vinculo_aceito', 1, 1, NULL),
('agenda', 'nova_consulta', 1, 2, NULL),
('agenda', 'lembrete_consulta', 1, NULL, 6),
('medicacao', 'hora_da_dose', 1, NULL, 6),
('tarefa', 'lembrete_prazo', 1, NULL, 7),
('agenda', 'lembrete_vespera', 0, NULL, 9),
('medicacao', 'dose_nao_confirmada', 0, NULL, 13),
('todas', NULL, 1, NULL, 17),
('agenda', 'lembrete_atendimento', 1, 4, NULL),
('tarefa', 'tarefa_respondida', 1, 5, NULL),
('tarefa', 'tarefa_em_andamento', 0, 8, NULL),
('paciente', 'paciente_inativo', 1, 12, NULL),
('agenda', 'consulta_cancelada', 0, 13, NULL),
('todas', NULL, 0, 10, NULL);

INSERT INTO tbl_notificacao (titulo_mensagem, lida, data_criacao, referencia_evento, id_categoria, id_profissional, id_paciente) VALUES
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-03-02 10:00:00', 'solicitacao_vinculo', 4, 1, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-03-03 09:00:00', 'vinculo_aceito', 4, NULL, 1),
('Você recebeu uma solicitação de vínculo de um profissional.', 1, '2026-03-06 11:00:00', 'solicitacao_vinculo', 4, NULL, 2),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-03-06 15:00:00', 'vinculo_aceito', 4, 1, NULL),
('Você recebeu uma solicitação de vínculo de um profissional.', 1, '2026-03-21 09:00:00', 'solicitacao_vinculo', 4, NULL, 6),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-03-21 12:00:00', 'vinculo_aceito', 4, 4, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-04-03 08:00:00', 'solicitacao_vinculo', 4, 4, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-04-03 14:00:00', 'vinculo_aceito', 4, NULL, 7),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-04-12 10:00:00', 'solicitacao_vinculo', 4, 5, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-04-13 09:00:00', 'vinculo_aceito', 4, NULL, 8),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-04-19 08:00:00', 'solicitacao_vinculo', 4, 2, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-04-20 09:30:00', 'vinculo_aceito', 4, NULL, 3),
('Você recebeu uma solicitação de vínculo de um profissional.', 1, '2026-05-04 11:00:00', 'solicitacao_vinculo', 4, NULL, 9),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-05-04 18:00:00', 'vinculo_aceito', 4, 5, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-05-20 09:00:00', 'solicitacao_vinculo', 4, 6, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-05-20 16:00:00', 'vinculo_aceito', 4, NULL, 10),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-05-23 20:00:00', 'solicitacao_vinculo', 4, 2, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-05-24 08:00:00', 'vinculo_aceito', 4, NULL, 4),
('Você recebeu uma solicitação de vínculo de um profissional.', 1, '2026-06-02 10:00:00', 'solicitacao_vinculo', 4, NULL, 11),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-06-02 19:00:00', 'vinculo_aceito', 4, 7, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-06-16 09:00:00', 'solicitacao_vinculo', 4, 12, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-06-16 13:00:00', 'vinculo_aceito', 4, NULL, 16),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-06-23 08:30:00', 'solicitacao_vinculo', 4, 8, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-06-24 09:00:00', 'vinculo_aceito', 4, NULL, 12),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-07-01 09:00:00', 'solicitacao_vinculo', 4, 6, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-07-02 10:00:00', 'vinculo_aceito', 4, NULL, 9),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-07-09 12:00:00', 'solicitacao_vinculo', 4, 9, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-07-09 17:00:00', 'vinculo_aceito', 4, NULL, 13),
('Você recebeu uma solicitação de vínculo de um profissional.', 1, '2026-07-26 10:00:00', 'solicitacao_vinculo', 4, NULL, 14),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-07-26 21:00:00', 'vinculo_aceito', 4, 10, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-08-04 09:00:00', 'solicitacao_vinculo', 4, 11, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-08-04 15:00:00', 'vinculo_aceito', 4, NULL, 15),
('Nova consulta agendada para 25/08/2026 às 09:00.', 1, '2026-08-19 10:00:00', 'nova_consulta:4', 7, 2, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-08-22 10:00:00', 'solicitacao_vinculo', 4, 12, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-08-23 09:00:00', 'vinculo_aceito', 4, NULL, 17),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-09-01 09:00:00', 'solicitacao_vinculo', 4, 4, NULL),
('O profissional aceitou a sua solicitação de vínculo.', 1, '2026-09-01 18:00:00', 'vinculo_aceito', 4, NULL, 1),
('Você recebeu uma solicitação de vínculo de um profissional.', 1, '2026-09-10 14:00:00', 'solicitacao_vinculo', 4, NULL, 17),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-09-10 20:00:00', 'vinculo_aceito', 4, 13, NULL),
('Nova consulta agendada para 06/10/2026 às 14:00.', 1, '2026-09-30 10:00:00', 'nova_consulta:3', 7, NULL, 1),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-10-02 08:00:00', 'nova_tarefa', 3, NULL, 2),
('Nova consulta agendada para 08/10/2026 às 11:00.', 1, '2026-10-02 10:00:00', 'nova_consulta:5', 7, 2, NULL),
('A consulta de 08/10/2026 às 11:00 foi cancelada.', 1, '2026-10-07 12:00:00', 'consulta_cancelada:5', 2, 2, NULL),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-10-12 09:00:00', 'nova_tarefa', 3, NULL, 1),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-10-12 09:00:00', 'nova_tarefa', 3, NULL, 2),
('Um paciente respondeu a uma tarefa.', 1, '2026-10-13 21:00:00', 'tarefa_respondida', 3, 1, NULL),
('Nova consulta agendada para 20/10/2026 às 14:00.', 1, '2026-10-14 10:00:00', 'nova_consulta:1', 7, NULL, 1),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-10-15 18:00:00', 'solicitacao_vinculo', 4, 2, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-10-16 09:30:00', 'solicitacao_vinculo', 4, 1, NULL),
('Nova consulta agendada para 22/10/2026 às 15:00.', 1, '2026-10-16 10:00:00', 'nova_consulta:2', 7, 1, NULL),
('Nova consulta agendada para 27/10/2026 às 11:00.', 1, '2026-10-21 10:00:00', 'nova_consulta:6', 7, NULL, 4),
('Nova consulta agendada para 03/11/2026 às 14:00.', 1, '2026-10-28 10:00:00', 'nova_consulta:7', 7, NULL, 1),
('Nova consulta agendada para 03/11/2026 às 10:30.', 1, '2026-10-28 10:00:00', 'nova_consulta:35', 7, NULL, 14),
('Nova consulta agendada para 04/11/2026 às 08:30.', 1, '2026-10-29 10:00:00', 'nova_consulta:10', 7, NULL, 2),
('Nova consulta agendada para 04/11/2026 às 09:30.', 1, '2026-10-29 10:00:00', 'nova_consulta:38', 7, NULL, 15),
('Nova consulta agendada para 05/11/2026 às 10:00.', 1, '2026-10-30 10:00:00', 'nova_consulta:12', 7, NULL, 4),
('Nova consulta agendada para 05/11/2026 às 15:30.', 1, '2026-10-30 10:00:00', 'nova_consulta:40', 7, NULL, 17),
('Nova consulta agendada para 06/11/2026 às 14:30.', 1, '2026-10-31 10:00:00', 'nova_consulta:42', 7, NULL, 17),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-01 10:05:00', 'nova_tarefa', 3, NULL, 6),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-01 10:05:00', 'nova_tarefa', 3, NULL, 7),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-01 10:05:00', 'nova_tarefa', 3, NULL, 1),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-03 09:10:00', 'nova_tarefa', 3, NULL, 8),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-03 09:10:00', 'nova_tarefa', 3, NULL, 9),
('Nova consulta agendada para 09/11/2026 às 09:30.', 1, '2026-11-03 10:00:00', 'nova_consulta:14', 7, NULL, 6),
('Nova consulta agendada para 09/11/2026 às 08:00.', 1, '2026-11-03 10:00:00', 'nova_consulta:17', 7, NULL, 7),
('Nova consulta agendada para 09/11/2026 às 15:30.', 1, '2026-11-03 10:00:00', 'nova_consulta:19', 7, NULL, 8),
('Nova consulta agendada para 09/11/2026 às 17:30.', 1, '2026-11-03 10:00:00', 'nova_consulta:21', 7, NULL, 9),
('Nova consulta agendada para 09/11/2026 às 10:30.', 1, '2026-11-03 10:00:00', 'nova_consulta:45', 7, NULL, 1),
('Nova consulta agendada para 10/11/2026 às 15:00.', 1, '2026-11-04 10:00:00', 'nova_consulta:9', 7, 1, NULL),
('Nova consulta agendada para 10/11/2026 às 07:30.', 1, '2026-11-04 10:00:00', 'nova_consulta:24', 7, NULL, 9),
('Nova consulta agendada para 11/11/2026 às 09:30.', 1, '2026-11-05 10:00:00', 'nova_consulta:44', 7, 13, NULL),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-05 14:00:00', 'nova_tarefa', 3, NULL, 9),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-05 14:00:00', 'nova_tarefa', 3, NULL, 10),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-05 21:30:00', 'tarefa_respondida', 3, 4, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-11-06 09:00:00', 'solicitacao_vinculo', 4, 8, NULL),
('Nova consulta agendada para 12/11/2026 às 08:00.', 1, '2026-11-06 10:00:00', 'nova_consulta:26', 7, NULL, 10),
('Nova consulta agendada para 12/11/2026 às 18:30.', 1, '2026-11-06 10:00:00', 'nova_consulta:28', 7, NULL, 11),
('Nova consulta agendada para 12/11/2026 às 15:30.', 1, '2026-11-06 10:00:00', 'nova_consulta:30', 7, 7, NULL),
('A consulta de 10/11/2026 às 15:00 foi cancelada.', 1, '2026-11-09 12:00:00', 'consulta_cancelada:9', 2, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-09 20:00:00', 'tarefa_respondida', 3, 5, NULL),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-10 08:30:00', 'nova_tarefa', 3, NULL, 11),
('Nova consulta agendada para 16/11/2026 às 10:30.', 1, '2026-11-10 10:00:00', 'nova_consulta:16', 7, 4, NULL),
('Nova consulta agendada para 16/11/2026 às 17:00.', 1, '2026-11-10 10:00:00', 'nova_consulta:23', 7, 5, NULL),
('Nova consulta agendada para 16/11/2026 às 13:00.', 1, '2026-11-10 10:00:00', 'nova_consulta:31', 7, NULL, 12),
('Nova consulta agendada para 16/11/2026 às 18:30.', 1, '2026-11-10 10:00:00', 'nova_consulta:33', 7, NULL, 13),
('A consulta de 12/11/2026 às 15:30 foi cancelada.', 1, '2026-11-11 12:00:00', 'consulta_cancelada:30', 2, 7, NULL),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-12 11:00:00', 'nova_tarefa', 3, NULL, 12),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-12 22:15:00', 'tarefa_respondida', 3, 6, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-14 19:40:00', 'tarefa_respondida', 3, 6, NULL),
('A consulta de 16/11/2026 às 10:30 foi cancelada.', 1, '2026-11-15 12:00:00', 'consulta_cancelada:16', 2, 4, NULL),
('A consulta de 16/11/2026 às 17:00 foi cancelada.', 1, '2026-11-15 12:00:00', 'consulta_cancelada:23', 2, 5, NULL),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-16 10:00:00', 'nova_tarefa', 3, NULL, 13),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-18 07:00:00', 'nova_tarefa', 3, NULL, 15),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-11-18 10:45:00', 'solicitacao_vinculo', 4, 13, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-18 23:00:00', 'tarefa_respondida', 3, 8, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-19 09:10:00', 'tarefa_respondida', 3, 11, NULL),
('Nova consulta agendada para 25/11/2026 às 08:30.', 1, '2026-11-19 10:00:00', 'nova_consulta:8', 7, NULL, 1),
('Nova consulta agendada para 25/11/2026 às 13:30.', 1, '2026-11-19 10:00:00', 'nova_consulta:32', 7, NULL, 12),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-20 09:00:00', 'nova_tarefa', 3, NULL, 17),
('Nova consulta agendada para 26/11/2026 às 15:00.', 1, '2026-11-20 10:00:00', 'nova_consulta:11', 7, 1, NULL),
('Nova consulta agendada para 27/11/2026 às 11:30.', 0, '2026-11-21 10:00:00', 'nova_consulta:34', 7, 9, NULL),
('Você recebeu uma solicitação de vínculo de um profissional.', 0, '2026-11-21 14:30:00', 'solicitacao_vinculo', 4, NULL, 19),
('Hora de tomar Fluoxetina 20 mg', 1, '2026-11-22 07:30:00', 'dose:12', 5, NULL, 7),
('Hora de tomar Sertralina 50 mg', 1, '2026-11-22 08:00:00', 'dose:1', 5, NULL, 1),
('Hora de tomar Clonazepam 0,5 mg', 1, '2026-11-22 08:00:00', 'dose:4', 5, NULL, 2),
('Hora de tomar Escitalopram 10 mg', 1, '2026-11-22 08:00:00', 'dose:9', 5, NULL, 6),
('Hora de tomar Bupropiona 150 mg', 0, '2026-11-22 08:00:00', 'dose:17', 5, NULL, 9),
('Hora de tomar Carbonato de lítio 300 mg', 1, '2026-11-22 08:00:00', 'dose:22', 5, NULL, 13),
('Hora de tomar Sertralina 100 mg', 1, '2026-11-22 08:30:00', 'dose:29', 5, NULL, 17),
('Hora de tomar Bupropiona 150 mg', 1, '2026-11-22 14:00:00', 'dose:20', 5, NULL, 9),
('Hora de tomar Carbonato de lítio 300 mg', 1, '2026-11-22 14:00:00', 'dose:25', 5, NULL, 13),
('Hora de tomar Clonazepam 0,5 mg', 0, '2026-11-22 20:00:00', 'dose:7', 5, NULL, 2),
('Hora de tomar Carbonato de lítio 300 mg', 0, '2026-11-22 20:00:00', 'dose:27', 5, NULL, 13),
('Hora de tomar Quetiapina 25 mg', 1, '2026-11-22 22:00:00', 'dose:15', 5, NULL, 9),
('Hora de tomar Fluoxetina 20 mg', 1, '2026-11-23 07:30:00', 'dose:13', 5, NULL, 7),
('Hora de tomar Sertralina 50 mg', 1, '2026-11-23 08:00:00', 'dose:2', 5, NULL, 1),
('Hora de tomar Clonazepam 0,5 mg', 0, '2026-11-23 08:00:00', 'dose:5', 5, NULL, 2),
('Hora de tomar Escitalopram 10 mg', 1, '2026-11-23 08:00:00', 'dose:10', 5, NULL, 6),
('Hora de tomar Bupropiona 150 mg', 1, '2026-11-23 08:00:00', 'dose:18', 5, NULL, 9),
('Hora de tomar Carbonato de lítio 300 mg', 1, '2026-11-23 08:00:00', 'dose:23', 5, NULL, 13),
('Hora de tomar Sertralina 100 mg', 1, '2026-11-23 08:30:00', 'dose:30', 5, NULL, 17),
('Nova consulta agendada para 30/11/2026 às 10:30.', 0, '2026-11-23 10:00:00', 'nova_consulta:13', 7, NULL, 4),
('Nova consulta agendada para 30/11/2026 às 10:00.', 0, '2026-11-23 10:00:00', 'nova_consulta:15', 7, 4, NULL),
('Nova consulta agendada para 30/11/2026 às 08:30.', 0, '2026-11-23 10:00:00', 'nova_consulta:18', 7, NULL, 7),
('Nova consulta agendada para 30/11/2026 às 16:00.', 0, '2026-11-23 10:00:00', 'nova_consulta:20', 7, 5, NULL),
('Nova consulta agendada para 02/12/2026 às 16:30.', 0, '2026-11-23 10:00:00', 'nova_consulta:22', 7, NULL, 9),
('Nova consulta agendada para 03/12/2026 às 08:00.', 0, '2026-11-23 10:00:00', 'nova_consulta:25', 7, 6, NULL),
('Nova consulta agendada para 03/12/2026 às 09:30.', 0, '2026-11-23 10:00:00', 'nova_consulta:27', 7, NULL, 10),
('Nova consulta agendada para 04/12/2026 às 19:00.', 0, '2026-11-23 10:00:00', 'nova_consulta:29', 7, 7, NULL),
('Nova consulta agendada para 30/11/2026 às 11:00.', 0, '2026-11-23 10:00:00', 'nova_consulta:36', 7, NULL, 14),
('Nova consulta agendada para 30/11/2026 às 06:30.', 0, '2026-11-23 10:00:00', 'nova_consulta:39', 7, 11, NULL),
('Nova consulta agendada para 01/12/2026 às 16:00.', 0, '2026-11-23 10:00:00', 'nova_consulta:41', 7, NULL, 17),
('Nova consulta agendada para 30/11/2026 às 09:00.', 0, '2026-11-23 10:00:00', 'nova_consulta:43', 7, 13, NULL),
('Nova consulta agendada para 01/12/2026 às 09:30.', 0, '2026-11-23 10:00:00', 'nova_consulta:46', 7, NULL, 1),
('Hora de tomar Bupropiona 150 mg', 1, '2026-11-23 14:00:00', 'dose:21', 5, NULL, 9),
('Hora de tomar Carbonato de lítio 300 mg', 0, '2026-11-23 14:00:00', 'dose:26', 5, NULL, 13),
('Hora de tomar Clonazepam 0,5 mg', 1, '2026-11-23 20:00:00', 'dose:8', 5, NULL, 2),
('Hora de tomar Carbonato de lítio 300 mg', 1, '2026-11-23 20:00:00', 'dose:28', 5, NULL, 13),
('Hora de tomar Quetiapina 25 mg', 0, '2026-11-23 22:00:00', 'dose:16', 5, NULL, 9),
('Hora de tomar Fluoxetina 20 mg', 0, '2026-11-24 07:30:00', 'dose:14', 5, NULL, 7),
('Amanhã (25/11/2026) você atende João Pedro Almeida às 08:30.', 0, '2026-11-24 08:00:00', 'lembrete_vespera:8', 9, 1, NULL),
('Lembrete: você tem consulta amanhã (25/11/2026) às 08:30.', 0, '2026-11-24 08:00:00', 'lembrete_vespera:8', 9, NULL, 1),
('Amanhã (25/11/2026) você atende Felipe Costa Barros às 13:30.', 0, '2026-11-24 08:00:00', 'lembrete_vespera:32', 9, 8, NULL),
('Lembrete: você tem consulta amanhã (25/11/2026) às 13:30.', 0, '2026-11-24 08:00:00', 'lembrete_vespera:32', 9, NULL, 12),
('Hora de tomar Sertralina 50 mg', 0, '2026-11-24 08:00:00', 'dose:3', 5, NULL, 1),
('Hora de tomar Clonazepam 0,5 mg', 1, '2026-11-24 08:00:00', 'dose:6', 5, NULL, 2),
('Hora de tomar Escitalopram 10 mg', 1, '2026-11-24 08:00:00', 'dose:11', 5, NULL, 6),
('Hora de tomar Bupropiona 150 mg', 1, '2026-11-24 08:00:00', 'dose:19', 5, NULL, 9),
('Hora de tomar Carbonato de lítio 300 mg', 0, '2026-11-24 08:00:00', 'dose:24', 5, NULL, 13),
('Hora de tomar Sertralina 100 mg', 0, '2026-11-24 08:30:00', 'dose:31', 5, NULL, 17);


-- ============================================================
-- EXTRAS (acrescentados para deixar a base completa)
-- ============================================================

-- ------------------------------------------------------------
-- MAIS ADMINISTRADORES (para testar "criado por" e o primeiro acesso do admin)
-- usuarios 42 e 43 | administradores 2 e 3
--   admin2@dialoga.com        -> criado pelo admin 1, senha já definida
--   admin.suporte@dialoga.com -> criado pelo admin 2, senha provisória (cai na tela de primeiro acesso)
-- ------------------------------------------------------------
INSERT INTO tbl_usuario (email, senha_hash, nivel, data_criacao, id_google) VALUES
('admin2@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 0, '2026-02-01 09:00:00', NULL),
('admin.suporte@dialoga.com', '$2b$10$iM68O7DU3Q61uaP.aBH6uedJ./l72wGfQYOBmQQ/Yg9BDvsDW8eaW', 0, '2026-11-20 10:00:00', NULL);

INSERT INTO tbl_administrador (nome_completo, senha_provisoria, celular, foto_avatar, id_usuario, id_administrador_criador) VALUES
('Helena Prado Ribeiro', 0, '(11) 99999-0001', 'https://i.pravatar.cc/300?img=47', 42, 1),
('Rodrigo Matos Pinheiro', 1, '(11) 99999-0002', NULL, 43, 2);

-- ------------------------------------------------------------
-- FOTOS DE PERFIL (links públicos de teste do pravatar.cc)
-- Quem fica sem foto aparece com as iniciais (teste do avatar sem imagem).
-- Para usar fotos suas, troque o link (ex.: o do Azure Blob).
-- ------------------------------------------------------------
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=12' WHERE id = 1;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=47' WHERE id = 2;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=33' WHERE id = 3;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=45' WHERE id = 4;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=15' WHERE id = 6;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=49' WHERE id = 7;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=52' WHERE id = 8;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=20' WHERE id = 9;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=60' WHERE id = 10;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=44' WHERE id = 11;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=59' WHERE id = 12;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=23' WHERE id = 13;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=53' WHERE id = 14;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=5' WHERE id = 15;
UPDATE tbl_paciente SET foto_avatar = 'https://i.pravatar.cc/300?img=9' WHERE id = 17;

UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=32' WHERE id = 1;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=11' WHERE id = 2;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=57' WHERE id = 4;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=25' WHERE id = 5;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=13' WHERE id = 6;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=68' WHERE id = 7;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=26' WHERE id = 8;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=61' WHERE id = 9;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=36' WHERE id = 10;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=3' WHERE id = 11;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=14' WHERE id = 12;
UPDATE tbl_profissional SET foto_avatar = 'https://i.pravatar.cc/300?img=65' WHERE id = 13;

-- ------------------------------------------------------------
-- CODIGO DE VERIFICACAO (recuperar senha)
-- Exemplos para a tabela não ficar vazia: um já usado, um expirado e um ainda válido.
-- O hash é só ilustrativo: os códigos de verdade são gerados pela API (HMAC com CODIGO_SECRET).
-- ------------------------------------------------------------
INSERT INTO tbl_codigo_verificacao (email, codigo_hash, finalidade, data_expiracao, data_utilizacao, tentativas, data_criacao) VALUES
('joao.paciente@email.com', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'recuperar_senha', '2026-11-10 10:10:00', '2026-11-10 10:04:00', 1, '2026-11-10 10:00:00'),
('maria.paciente@email.com', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'recuperar_senha', '2026-11-15 18:10:00', NULL, 5, '2026-11-15 18:00:00'),
('ana.psi@dialoga.com', 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', 'recuperar_senha', '2030-01-01 00:00:00', NULL, 0, '2026-11-24 09:00:00');


-- ============================================================
-- CONTA CHEIA: Dra. Ana Beatriz Souza (profissional 1)
-- login: ana.psi@dialoga.com  |  senha: 123456
-- 13 vínculos (11 ativos), ~107 consultas, 33 anotações, 11 solicitações de acesso,
-- 7 formulários (6 enviados + 1 rascunho) + 3 autotarefas, 57 respostas,
-- 183 registros de humor, 3 tratamentos com doses, 70 notificações.
-- ============================================================

-- ------------------------------------------------------------
-- VINCULOS da Dra. Ana Beatriz (profissional 1): 11 ativos + pendentes, encerrado e recusado
-- ------------------------------------------------------------
INSERT INTO tbl_vinculo (status, origem_cadastro, data_solicitacao, data_aceite, data_inicio_acompanhamento, data_fim, id_profissional, id_paciente) VALUES
('ativo', 'paciente', '2026-06-14 10:00:00', '2026-06-15 09:00:00', '2026-06-15 09:00:00', NULL, 1, 6),
('ativo', 'profissional', '2026-05-03 10:00:00', '2026-05-04 09:00:00', '2026-05-04 09:00:00', NULL, 1, 7),
('ativo', 'paciente', '2026-07-19 10:00:00', '2026-07-20 09:00:00', '2026-07-20 09:00:00', NULL, 1, 8),
('ativo', 'profissional', '2026-04-26 10:00:00', '2026-04-27 09:00:00', '2026-04-27 09:00:00', NULL, 1, 9),
('ativo', 'paciente', '2026-08-02 10:00:00', '2026-08-03 09:00:00', '2026-08-03 09:00:00', NULL, 1, 10),
('ativo', 'profissional', '2026-09-13 10:00:00', '2026-09-14 09:00:00', '2026-09-14 09:00:00', NULL, 1, 11),
('ativo', 'paciente', '2026-06-28 10:00:00', '2026-06-29 09:00:00', '2026-06-29 09:00:00', NULL, 1, 12),
('ativo', 'profissional', '2026-10-04 10:00:00', '2026-10-05 09:00:00', '2026-10-05 09:00:00', NULL, 1, 13),
('ativo', 'paciente', '2026-05-17 10:00:00', '2026-05-18 09:00:00', '2026-05-18 09:00:00', NULL, 1, 14),
('ativo', 'profissional', '2026-08-23 10:00:00', '2026-08-24 09:00:00', '2026-08-24 09:00:00', NULL, 1, 15),
('ativo', 'profissional', '2026-09-27 10:00:00', '2026-09-28 09:00:00', '2026-09-28 09:00:00', NULL, 1, 17),
('pendente', 'paciente', '2026-11-18 10:45:00', NULL, NULL, NULL, 1, 18),
('pendente', 'profissional', '2026-11-22 16:20:00', NULL, NULL, NULL, 1, 19),
('encerrado', 'paciente', '2026-02-10 09:00:00', '2026-02-11 10:00:00', '2026-02-11 10:00:00', '2026-09-30 18:00:00', 1, 16),
('recusado', 'profissional', '2026-11-12 14:00:00', NULL, NULL, NULL, 1, 20);


-- ------------------------------------------------------------
-- DISPONIBILIDADE extra da Ana: sábados de manhã (semanal) e um sábado à tarde (única)
-- ------------------------------------------------------------
INSERT INTO tbl_disponibilidade (hora_inicio, hora_fim, tipo_repeticao, data_inicial, data_final, id_profissional) VALUES
('09:00:00', '12:00:00', 'semanal', NULL, NULL, 1),
('14:00:00', '18:00:00', 'unica', '2026-12-19', '2026-12-19', 1);

INSERT INTO tbl_dias_da_semana_disponibilidade (id_dias_da_semana, id_disponibilidade) VALUES
(7, 19),
(7, 20);


-- ------------------------------------------------------------
-- CONSULTAS: sessão semanal de cada paciente (12/10 a 21/12), com algumas canceladas
-- ------------------------------------------------------------
INSERT INTO tbl_consulta (criado_por, nome_da_consulta, especialidade, data, hora, status, id_vinculo) VALUES
('paciente', 'Retorno - Gabi', 'Psicologia Clínica', '2026-10-12', '09:00:00', 'agendada', 25),
('profissional', 'Sessão semanal - Gabi', 'Terapia Cognitivo-Comportamental', '2026-10-19', '09:00:00', 'agendada', 25),
('profissional', 'Sessão semanal - Gabi', 'Psicologia Clínica', '2026-10-26', '09:00:00', 'agendada', 25),
('paciente', 'Retorno - Gabi', 'Terapia Cognitivo-Comportamental', '2026-11-02', '09:00:00', 'agendada', 25),
('profissional', 'Sessão semanal - Gabi', 'Psicologia Clínica', '2026-11-09', '09:00:00', 'agendada', 25),
('profissional', 'Sessão semanal - Gabi', 'Terapia Cognitivo-Comportamental', '2026-11-16', '09:00:00', 'agendada', 25),
('paciente', 'Retorno - Gabi', 'Psicologia Clínica', '2026-11-23', '09:00:00', 'agendada', 25),
('profissional', 'Sessão semanal - Gabi', 'Terapia Cognitivo-Comportamental', '2026-11-30', '09:00:00', 'cancelada', 25),
('profissional', 'Sessão semanal - Gabi', 'Psicologia Clínica', '2026-12-07', '09:00:00', 'agendada', 25),
('paciente', 'Retorno - Gabi', 'Terapia Cognitivo-Comportamental', '2026-12-14', '09:00:00', 'agendada', 25),
('profissional', 'Sessão semanal - Gabi', 'Psicologia Clínica', '2026-12-21', '09:00:00', 'agendada', 25),
('profissional', 'Sessão semanal - Isa', 'Terapia Cognitivo-Comportamental', '2026-10-12', '10:00:00', 'agendada', 26),
('profissional', 'Sessão semanal - Isa', 'Psicologia Clínica', '2026-10-19', '10:00:00', 'agendada', 26),
('paciente', 'Retorno - Isa', 'Terapia Cognitivo-Comportamental', '2026-10-26', '10:00:00', 'agendada', 26),
('profissional', 'Sessão semanal - Isa', 'Psicologia Clínica', '2026-11-02', '10:00:00', 'agendada', 26),
('profissional', 'Sessão semanal - Isa', 'Terapia Cognitivo-Comportamental', '2026-11-09', '10:00:00', 'agendada', 26),
('paciente', 'Retorno - Isa', 'Psicologia Clínica', '2026-11-16', '10:00:00', 'agendada', 26),
('profissional', 'Sessão semanal - Isa', 'Terapia Cognitivo-Comportamental', '2026-11-23', '10:00:00', 'agendada', 26),
('profissional', 'Sessão semanal - Isa', 'Psicologia Clínica', '2026-11-30', '10:00:00', 'agendada', 26),
('paciente', 'Retorno - Isa', 'Terapia Cognitivo-Comportamental', '2026-12-07', '10:00:00', 'agendada', 26),
('profissional', 'Sessão semanal - Isa', 'Psicologia Clínica', '2026-12-14', '10:00:00', 'agendada', 26),
('profissional', 'Sessão semanal - Isa', 'Terapia Cognitivo-Comportamental', '2026-12-21', '10:00:00', 'cancelada', 26),
('profissional', 'Sessão semanal - Lucas', 'Psicologia Clínica', '2026-10-13', '15:00:00', 'agendada', 27),
('paciente', 'Retorno - Lucas', 'Terapia Cognitivo-Comportamental', '2026-10-20', '15:00:00', 'agendada', 27),
('profissional', 'Sessão semanal - Lucas', 'Psicologia Clínica', '2026-10-27', '15:00:00', 'cancelada', 27),
('profissional', 'Sessão semanal - Lucas', 'Terapia Cognitivo-Comportamental', '2026-11-03', '15:00:00', 'agendada', 27),
('paciente', 'Retorno - Lucas', 'Psicologia Clínica', '2026-11-10', '15:00:00', 'agendada', 27),
('profissional', 'Sessão semanal - Lucas', 'Terapia Cognitivo-Comportamental', '2026-11-17', '15:00:00', 'agendada', 27),
('profissional', 'Sessão semanal - Lucas', 'Psicologia Clínica', '2026-11-24', '15:00:00', 'agendada', 27),
('paciente', 'Retorno - Lucas', 'Terapia Cognitivo-Comportamental', '2026-12-01', '15:00:00', 'agendada', 27),
('profissional', 'Sessão semanal - Lucas', 'Psicologia Clínica', '2026-12-08', '15:00:00', 'agendada', 27),
('profissional', 'Sessão semanal - Lucas', 'Terapia Cognitivo-Comportamental', '2026-12-15', '15:00:00', 'agendada', 27),
('paciente', 'Retorno - Bia', 'Terapia Cognitivo-Comportamental', '2026-10-13', '16:00:00', 'agendada', 28),
('profissional', 'Sessão semanal - Bia', 'Psicologia Clínica', '2026-10-20', '16:00:00', 'agendada', 28),
('profissional', 'Sessão semanal - Bia', 'Terapia Cognitivo-Comportamental', '2026-10-27', '16:00:00', 'agendada', 28),
('paciente', 'Retorno - Bia', 'Psicologia Clínica', '2026-11-03', '16:00:00', 'agendada', 28),
('profissional', 'Sessão semanal - Bia', 'Terapia Cognitivo-Comportamental', '2026-11-10', '16:00:00', 'agendada', 28),
('profissional', 'Sessão semanal - Bia', 'Psicologia Clínica', '2026-11-17', '16:00:00', 'cancelada', 28),
('paciente', 'Retorno - Bia', 'Terapia Cognitivo-Comportamental', '2026-11-24', '16:00:00', 'agendada', 28),
('profissional', 'Sessão semanal - Bia', 'Psicologia Clínica', '2026-12-01', '16:00:00', 'agendada', 28),
('profissional', 'Sessão semanal - Bia', 'Terapia Cognitivo-Comportamental', '2026-12-08', '16:00:00', 'agendada', 28),
('paciente', 'Retorno - Bia', 'Psicologia Clínica', '2026-12-15', '16:00:00', 'agendada', 28),
('profissional', 'Sessão semanal - Matheus', 'Psicologia Clínica', '2026-10-14', '10:00:00', 'agendada', 29),
('profissional', 'Sessão semanal - Matheus', 'Terapia Cognitivo-Comportamental', '2026-10-21', '10:00:00', 'agendada', 29),
('paciente', 'Retorno - Matheus', 'Psicologia Clínica', '2026-10-28', '10:00:00', 'agendada', 29),
('profissional', 'Sessão semanal - Matheus', 'Terapia Cognitivo-Comportamental', '2026-11-04', '10:00:00', 'agendada', 29),
('profissional', 'Sessão semanal - Matheus', 'Psicologia Clínica', '2026-11-11', '10:00:00', 'agendada', 29),
('paciente', 'Retorno - Matheus', 'Terapia Cognitivo-Comportamental', '2026-11-18', '10:00:00', 'agendada', 29),
('profissional', 'Sessão semanal - Matheus', 'Psicologia Clínica', '2026-11-25', '10:00:00', 'agendada', 29),
('profissional', 'Sessão semanal - Matheus', 'Terapia Cognitivo-Comportamental', '2026-12-02', '10:00:00', 'agendada', 29),
('paciente', 'Retorno - Matheus', 'Psicologia Clínica', '2026-12-09', '10:00:00', 'cancelada', 29),
('profissional', 'Sessão semanal - Matheus', 'Terapia Cognitivo-Comportamental', '2026-12-16', '10:00:00', 'agendada', 29),
('profissional', 'Sessão semanal - Larissa', 'Terapia Cognitivo-Comportamental', '2026-10-14', '11:00:00', 'agendada', 30),
('paciente', 'Retorno - Larissa', 'Psicologia Clínica', '2026-10-21', '11:00:00', 'agendada', 30),
('profissional', 'Sessão semanal - Larissa', 'Terapia Cognitivo-Comportamental', '2026-10-28', '11:00:00', 'agendada', 30),
('profissional', 'Sessão semanal - Larissa', 'Psicologia Clínica', '2026-11-04', '11:00:00', 'agendada', 30),
('paciente', 'Retorno - Larissa', 'Terapia Cognitivo-Comportamental', '2026-11-11', '11:00:00', 'agendada', 30),
('profissional', 'Sessão semanal - Larissa', 'Psicologia Clínica', '2026-11-18', '11:00:00', 'agendada', 30),
('profissional', 'Sessão semanal - Larissa', 'Terapia Cognitivo-Comportamental', '2026-11-25', '11:00:00', 'agendada', 30),
('paciente', 'Retorno - Larissa', 'Psicologia Clínica', '2026-12-02', '11:00:00', 'agendada', 30),
('profissional', 'Sessão semanal - Larissa', 'Terapia Cognitivo-Comportamental', '2026-12-09', '11:00:00', 'agendada', 30),
('profissional', 'Sessão semanal - Larissa', 'Psicologia Clínica', '2026-12-16', '11:00:00', 'agendada', 30),
('paciente', 'Retorno - Felipe', 'Psicologia Clínica', '2026-10-15', '14:00:00', 'agendada', 31),
('profissional', 'Sessão semanal - Felipe', 'Terapia Cognitivo-Comportamental', '2026-10-22', '14:00:00', 'agendada', 31),
('profissional', 'Sessão semanal - Felipe', 'Psicologia Clínica', '2026-10-29', '14:00:00', 'agendada', 31),
('paciente', 'Retorno - Felipe', 'Terapia Cognitivo-Comportamental', '2026-11-05', '14:00:00', 'cancelada', 31),
('profissional', 'Sessão semanal - Felipe', 'Psicologia Clínica', '2026-11-12', '14:00:00', 'agendada', 31),
('profissional', 'Sessão semanal - Felipe', 'Terapia Cognitivo-Comportamental', '2026-11-19', '14:00:00', 'agendada', 31),
('paciente', 'Retorno - Felipe', 'Psicologia Clínica', '2026-11-26', '14:00:00', 'agendada', 31),
('profissional', 'Sessão semanal - Felipe', 'Terapia Cognitivo-Comportamental', '2026-12-03', '14:00:00', 'agendada', 31),
('profissional', 'Sessão semanal - Felipe', 'Psicologia Clínica', '2026-12-10', '14:00:00', 'agendada', 31),
('paciente', 'Retorno - Felipe', 'Terapia Cognitivo-Comportamental', '2026-12-17', '14:00:00', 'agendada', 31),
('profissional', 'Sessão semanal - Amanda', 'Terapia Cognitivo-Comportamental', '2026-10-15', '16:00:00', 'agendada', 32),
('profissional', 'Sessão semanal - Amanda', 'Psicologia Clínica', '2026-10-22', '16:00:00', 'agendada', 32),
('paciente', 'Retorno - Amanda', 'Terapia Cognitivo-Comportamental', '2026-10-29', '16:00:00', 'agendada', 32),
('profissional', 'Sessão semanal - Amanda', 'Psicologia Clínica', '2026-11-05', '16:00:00', 'agendada', 32),
('profissional', 'Sessão semanal - Amanda', 'Terapia Cognitivo-Comportamental', '2026-11-12', '16:00:00', 'agendada', 32),
('paciente', 'Retorno - Amanda', 'Psicologia Clínica', '2026-11-19', '16:00:00', 'agendada', 32),
('profissional', 'Sessão semanal - Amanda', 'Terapia Cognitivo-Comportamental', '2026-11-26', '16:00:00', 'cancelada', 32),
('profissional', 'Sessão semanal - Amanda', 'Psicologia Clínica', '2026-12-03', '16:00:00', 'agendada', 32),
('paciente', 'Retorno - Amanda', 'Terapia Cognitivo-Comportamental', '2026-12-10', '16:00:00', 'agendada', 32),
('profissional', 'Sessão semanal - Amanda', 'Psicologia Clínica', '2026-12-17', '16:00:00', 'agendada', 32),
('profissional', 'Sessão semanal - Vinícius', 'Psicologia Clínica', '2026-10-16', '08:00:00', 'agendada', 33),
('paciente', 'Retorno - Vinícius', 'Terapia Cognitivo-Comportamental', '2026-10-23', '08:00:00', 'agendada', 33),
('profissional', 'Sessão semanal - Vinícius', 'Psicologia Clínica', '2026-10-30', '08:00:00', 'agendada', 33),
('profissional', 'Sessão semanal - Vinícius', 'Terapia Cognitivo-Comportamental', '2026-11-06', '08:00:00', 'agendada', 33),
('paciente', 'Retorno - Vinícius', 'Psicologia Clínica', '2026-11-13', '08:00:00', 'agendada', 33),
('profissional', 'Sessão semanal - Vinícius', 'Terapia Cognitivo-Comportamental', '2026-11-20', '08:00:00', 'agendada', 33),
('profissional', 'Sessão semanal - Vinícius', 'Psicologia Clínica', '2026-11-27', '08:00:00', 'agendada', 33),
('paciente', 'Retorno - Vinícius', 'Terapia Cognitivo-Comportamental', '2026-12-04', '08:00:00', 'agendada', 33),
('profissional', 'Sessão semanal - Vinícius', 'Psicologia Clínica', '2026-12-11', '08:00:00', 'agendada', 33),
('profissional', 'Sessão semanal - Vinícius', 'Terapia Cognitivo-Comportamental', '2026-12-18', '08:00:00', 'cancelada', 33),
('paciente', 'Retorno - Carol', 'Terapia Cognitivo-Comportamental', '2026-10-16', '10:00:00', 'agendada', 34),
('profissional', 'Sessão semanal - Carol', 'Psicologia Clínica', '2026-10-30', '10:00:00', 'cancelada', 34),
('profissional', 'Sessão semanal - Carol', 'Terapia Cognitivo-Comportamental', '2026-11-13', '10:00:00', 'agendada', 34),
('paciente', 'Retorno - Carol', 'Psicologia Clínica', '2026-11-27', '10:00:00', 'agendada', 34),
('profissional', 'Sessão semanal - Carol', 'Terapia Cognitivo-Comportamental', '2026-12-11', '10:00:00', 'agendada', 34),
('profissional', 'Sessão semanal - Natália', 'Terapia Cognitivo-Comportamental', '2026-10-17', '09:00:00', 'agendada', 35),
('paciente', 'Retorno - Natália', 'Psicologia Clínica', '2026-10-24', '09:00:00', 'agendada', 35),
('profissional', 'Sessão semanal - Natália', 'Terapia Cognitivo-Comportamental', '2026-10-31', '09:00:00', 'agendada', 35),
('profissional', 'Sessão semanal - Natália', 'Psicologia Clínica', '2026-11-07', '09:00:00', 'agendada', 35),
('paciente', 'Retorno - Natália', 'Terapia Cognitivo-Comportamental', '2026-11-14', '09:00:00', 'agendada', 35),
('profissional', 'Sessão semanal - Natália', 'Psicologia Clínica', '2026-11-21', '09:00:00', 'agendada', 35),
('profissional', 'Sessão semanal - Natália', 'Terapia Cognitivo-Comportamental', '2026-11-28', '09:00:00', 'agendada', 35),
('paciente', 'Retorno - Natália', 'Psicologia Clínica', '2026-12-05', '09:00:00', 'cancelada', 35),
('profissional', 'Sessão semanal - Natália', 'Terapia Cognitivo-Comportamental', '2026-12-12', '09:00:00', 'agendada', 35),
('profissional', 'Sessão semanal - Natália', 'Psicologia Clínica', '2026-12-19', '09:00:00', 'agendada', 35);


-- ------------------------------------------------------------
-- ANOTACOES privadas da Ana (3 por paciente; algumas editadas)
-- ------------------------------------------------------------
INSERT INTO tbl_anotacao (titulo, conteudo, data_criacao, data_edicao, id_profissional, id_paciente) VALUES
('Primeira sessão (anamnese)', 'Queixa principal: preocupação excessiva e tensão muscular. Sem histórico psiquiátrico prévio. Combinado registro diário de humor e treino de respiração diafragmática.', '2026-06-23 15:42:00', NULL, 1, 6),
('Evolução - setembro', 'Relata menos episódios de aperto no peito. Aplicada reestruturação cognitiva para pensamentos catastróficos no trabalho.', '2026-07-23 16:55:00', NULL, 1, 6),
('Plano para novembro', 'Manter registro de pensamentos e iniciar exposição gradual a situações de cobrança. Reavaliar escala de ansiedade em 3 semanas.', '2026-08-22 09:08:00', '2026-08-23 09:15:00', 1, 6),
('Acolhimento', 'Paciente em luto recente pelo pai. Choro frequente e dificuldade para dormir. Priorizado acolhimento e rede de apoio familiar.', '2026-05-13 16:49:00', NULL, 1, 7),
('Evolução - agosto', 'Consegue falar sobre a perda sem interromper a sessão. Retomou caminhadas leves e contato com amigas.', '2026-06-12 09:02:00', '2026-06-13 09:15:00', 1, 7),
('Datas difíceis', 'Aproximação do aniversário do pai gera apreensão. Combinado ritual simbólico e contato extra se necessário.', '2026-07-12 10:15:00', NULL, 1, 7),
('Primeira sessão', 'Insônia há 4 meses associada a sobrecarga no trabalho. Higiene do sono orientada. Sem uso de medicação ainda.', '2026-07-30 09:56:00', '2026-07-31 09:15:00', 1, 8),
('Avaliação do sono', 'Média de 5h por noite. Uso de telas antes de dormir. Proposto diário do sono por duas semanas.', '2026-08-29 10:09:00', NULL, 1, 8),
('Encaminhamento', 'Discutida avaliação médica. Paciente concorda em procurar psiquiatra caso não haja melhora em 30 dias.', '2026-09-28 11:22:00', NULL, 1, 8),
('Primeira sessão', 'Evita apresentações e eventos sociais por medo de julgamento. Boa motivação para tratamento em TCC.', '2026-05-08 10:03:00', NULL, 1, 9),
('Hierarquia de exposição', 'Construída hierarquia com 8 situações. Primeira meta: cumprimentar colegas e puxar conversa curta.', '2026-06-07 11:16:00', NULL, 1, 9),
('Evolução - outubro', 'Realizou apresentação de 5 minutos para a equipe com ansiedade moderada (6/10). Reforçados avanços.', '2026-07-07 12:29:00', NULL, 1, 9),
('Primeira sessão', 'Desânimo, perda de interesse e alterações de apetite há 2 meses. Sem ideação suicida. Combinado acompanhamento semanal.', '2026-08-10 11:10:00', NULL, 1, 10),
('Ativação comportamental', 'Planejadas 3 atividades prazerosas por semana. Adesão parcial, relata cansaço pela manhã.', '2026-09-09 12:23:00', NULL, 1, 10),
('Evolução', 'Humor mais estável nas últimas semanas. Voltou a treinar duas vezes por semana.', '2026-10-09 13:36:00', '2026-10-10 09:15:00', 1, 10),
('Primeira sessão', 'Exaustão emocional, irritabilidade e sensação de ineficácia. Jornada acima de 50 horas semanais.', '2026-09-22 12:17:00', NULL, 1, 11),
('Limites e rotina', 'Trabalhado estabelecimento de limites com a chefia. Combinado desligar notificações após as 19h.', '2026-10-22 13:30:00', '2026-10-23 09:15:00', 1, 11),
('Evolução', 'Primeira semana com pausa real de almoço. Relata menos culpa ao dizer não.', '2026-11-21 14:43:00', NULL, 1, 11),
('Primeira sessão', 'Queixa de conflitos recorrentes com a parceira e dificuldade de comunicar o que sente.', '2026-07-08 13:24:00', '2026-07-09 09:15:00', 1, 12),
('Comunicação assertiva', 'Treinada comunicação não violenta com role-play. Paciente identificou padrão de evitação.', '2026-08-07 14:37:00', NULL, 1, 12),
('Sessão com ajuste de metas', 'Humor oscilante nas últimas semanas. Revisadas expectativas e combinada conversa estruturada em casa.', '2026-09-06 15:50:00', NULL, 1, 12),
('Primeira sessão', 'Dificuldade para manter foco e organizar tarefas. Sugerida avaliação neuropsicológica complementar.', '2026-10-15 14:31:00', NULL, 1, 13),
('Estratégias de organização', 'Introduzidos agenda visual, blocos de tempo e lista única de pendências.', '2026-11-14 15:44:00', NULL, 1, 13),
('Acompanhamento', 'Melhora na pontualidade. Ainda relata procrastinação em tarefas longas.', '2026-11-20 16:57:00', NULL, 1, 13),
('Primeira sessão', 'Pensamentos autocríticos intensos e comparação constante com colegas. Sem histórico de tratamento.', '2026-05-29 15:38:00', NULL, 1, 14),
('Diário de conquistas', 'Iniciado registro de três conquistas diárias. Dificuldade inicial em reconhecer méritos.', '2026-06-28 16:51:00', NULL, 1, 14),
('Evolução - outubro', 'Consegue citar qualidades sem ironia. Aceitou convite para um evento social.', '2026-07-28 09:04:00', '2026-07-29 09:15:00', 1, 14),
('Primeira sessão', 'Quatro crises de pânico nos últimos 3 meses, a última no metrô. Evita transporte público.', '2026-08-31 16:45:00', NULL, 1, 15),
('Psicoeducação do pânico', 'Explicado ciclo do pânico e treinada respiração. Paciente entendeu relação entre catastrofização e sintomas.', '2026-09-30 09:58:00', '2026-10-01 09:15:00', 1, 15),
('Exposição interoceptiva', 'Realizados exercícios de exposição a sensações corporais em sessão, com boa tolerância.', '2026-10-30 10:11:00', NULL, 1, 15),
('Primeira sessão', 'Dificuldade de adaptação à universidade e saudade de casa. Queixa de isolamento e sono irregular.', '2026-10-07 10:59:00', NULL, 1, 17),
('Rede de apoio', 'Incentivada participação em um grupo de estudos. Paciente aceitou testar por duas semanas.', '2026-11-06 11:12:00', NULL, 1, 17),
('Evolução', 'Relata duas novas amizades e melhor rotina de sono.', '2026-11-20 12:25:00', NULL, 1, 17);


-- ------------------------------------------------------------
-- SOLICITACOES DE ACESSO aos indicadores (aprovadas, pendentes e reprovadas)
-- ------------------------------------------------------------
INSERT INTO tbl_solicitacao_acesso (status, data_solicitacao, data_resposta, id_profissional, id_paciente) VALUES
('aprovada', '2026-06-25 10:00:00', '2026-06-26 08:30:00', 1, 6),
('aprovada', '2026-05-14 10:00:00', '2026-05-15 08:30:00', 1, 7),
('aprovada', '2026-07-30 10:00:00', '2026-07-31 08:30:00', 1, 8),
('aprovada', '2026-05-07 10:00:00', '2026-05-08 08:30:00', 1, 9),
('pendente', '2026-11-20 10:00:00', NULL, 1, 10),
('aprovada', '2026-09-24 10:00:00', '2026-09-25 08:30:00', 1, 11),
('reprovada', '2026-07-09 10:00:00', '2026-07-10 08:30:00', 1, 12),
('pendente', '2026-11-17 10:00:00', NULL, 1, 13),
('aprovada', '2026-05-28 10:00:00', '2026-05-29 08:30:00', 1, 14),
('aprovada', '2026-09-03 10:00:00', '2026-09-04 08:30:00', 1, 15),
('pendente', '2026-11-21 10:00:00', NULL, 1, 17);

INSERT INTO tbl_categoria_compartilhada (categoria, autorizado, id_solicitacao_acesso) VALUES
('Humor', 1, 18),
('Horas de sono', 1, 18),
('Tratamentos', 1, 18),
('Sentimento', 1, 18),
('Energia', 1, 18),
('Pensamentos', 1, 18),
('Acontecimentos', 1, 18),
('Humor', 1, 19),
('Horas de sono', 1, 19),
('Tratamentos', 1, 19),
('Pensamentos', 1, 19),
('Humor', 1, 20),
('Horas de sono', 1, 20),
('Sentimento', 1, 20),
('Energia', 1, 20),
('Pensamentos', 1, 20),
('Acontecimentos', 1, 20),
('Humor', 1, 21),
('Energia', 1, 21),
('Pensamentos', 1, 21),
('Acontecimentos', 1, 21),
('Humor', 1, 23),
('Horas de sono', 1, 23),
('Sentimento', 1, 23),
('Energia', 1, 23),
('Acontecimentos', 1, 23),
('Humor', 1, 26),
('Horas de sono', 1, 26),
('Tratamentos', 1, 26),
('Sentimento', 1, 26),
('Energia', 1, 26),
('Acontecimentos', 1, 26),
('Horas de sono', 1, 27),
('Tratamentos', 1, 27),
('Energia', 1, 27),
('Pensamentos', 1, 27);


-- ------------------------------------------------------------
-- TAREFAS: 6 formulários publicados + 1 rascunho + 3 autotarefas, com perguntas, opções, destinatários e respostas
-- ------------------------------------------------------------
INSERT INTO tbl_tarefa (titulo, tipo, instrucoes, anexo_arquivo, is_rascunho, data_criacao, data_envio, id_profissional_criador, id_paciente_criador) VALUES
('Questionário de humor (PHQ-9 adaptado)', 'formulario', 'Considere as últimas duas semanas.', NULL, 0, '2026-11-02 09:00:00', '2026-11-02 09:00:00', 1, NULL),
('Registro de pensamentos automáticos', 'formulario', 'Preencha quando perceber uma mudança forte de humor.', NULL, 0, '2026-11-04 10:00:00', '2026-11-04 10:00:00', 1, NULL),
('Checklist de higiene do sono', 'formulario', 'Responda ao longo da semana.', NULL, 0, '2026-11-09 08:00:00', '2026-11-09 08:00:00', 1, NULL),
('Hierarquia de exposição gradual', 'formulario', 'Liste situações da mais fácil para a mais difícil.', NULL, 0, '2026-11-11 15:00:00', '2026-11-11 15:00:00', 1, NULL),
('Check-in semanal de emoções', 'formulario', 'Responda todo domingo à noite.', NULL, 0, '2026-11-15 18:00:00', '2026-11-15 18:00:00', 1, NULL),
('Plano de autocuidado', 'formulario', 'Escolha o que fizer sentido para você.', NULL, 0, '2026-11-18 11:00:00', '2026-11-18 11:00:00', 1, NULL),
('Escala de estresse percebido (PSS-10)', 'formulario', 'Rascunho: revisar itens antes de enviar.', NULL, 1, '2026-11-23 17:00:00', NULL, 1, NULL),
('Praticar respiração 4-7-8', 'autotarefa', NULL, NULL, 0, '2026-11-20 07:15:00', '2026-11-20 07:15:00', NULL, 6),
('Ligar para um amigo', 'autotarefa', NULL, NULL, 0, '2026-11-19 21:10:00', '2026-11-19 21:10:00', NULL, 9),
('Aula de yoga', 'autotarefa', NULL, NULL, 0, '2026-11-21 08:05:00', '2026-11-21 08:05:00', NULL, 15);

INSERT INTO tbl_pergunta (tipo, texto, imagem, obrigatoria, ordem, id_tarefa) VALUES
('unica', 'Pouco interesse ou prazer em fazer as coisas', NULL, 1, 1, 16),
('unica', 'Sentir-se para baixo, deprimido(a) ou sem esperança', NULL, 1, 2, 16),
('unica', 'Dificuldade para dormir ou dormir demais', NULL, 1, 3, 16),
('paragrafo', 'Quer comentar algo que o questionário não perguntou?', NULL, 0, 4, 16),
('paragrafo', 'Qual foi a situação?', NULL, 1, 1, 17),
('paragrafo', 'Qual pensamento passou pela sua cabeça?', NULL, 1, 2, 17),
('unica', 'Qual a intensidade da emoção?', NULL, 1, 3, 17),
('paragrafo', 'Que pensamento alternativo, mais equilibrado, você poderia ter?', NULL, 0, 4, 17),
('multipla', 'Quais hábitos você manteve esta semana?', NULL, 1, 1, 18),
('escala', 'De 0 a 10, como foi a qualidade do seu sono?', NULL, 1, 2, 18),
('unica', 'Acordou durante a noite?', NULL, 1, 3, 18),
('paragrafo', 'Situação mais fácil de enfrentar', NULL, 1, 1, 19),
('paragrafo', 'Situação intermediária', NULL, 1, 2, 19),
('paragrafo', 'Situação mais difícil', NULL, 1, 3, 19),
('escala', 'De 0 a 10, quanto desconforto você sente ao pensar na mais difícil?', NULL, 1, 4, 19),
('emocoes', 'Como você se sentiu nesta semana?', NULL, 1, 1, 20),
('escala', 'De 0 a 10, qual seu nível de energia?', NULL, 1, 2, 20),
('paragrafo', 'O que mais marcou a sua semana?', NULL, 0, 3, 20),
('multipla', 'Quais atividades você quer incluir na sua semana?', NULL, 1, 1, 21),
('paragrafo', 'Como você vai lembrar de cumprir esse plano?', NULL, 0, 2, 21),
('escala', 'Com que frequência você se sentiu incapaz de controlar as coisas importantes da sua vida?', NULL, 1, 1, 22);

INSERT INTO tbl_opcao_pergunta (texto, ordem, id_pergunta) VALUES
('Nenhuma vez', 1, 22),
('Vários dias', 2, 22),
('Mais da metade dos dias', 3, 22),
('Quase todos os dias', 4, 22),
('Nenhuma vez', 1, 23),
('Vários dias', 2, 23),
('Mais da metade dos dias', 3, 23),
('Quase todos os dias', 4, 23),
('Nenhuma vez', 1, 24),
('Vários dias', 2, 24),
('Mais da metade dos dias', 3, 24),
('Quase todos os dias', 4, 24),
('Leve', 1, 28),
('Moderada', 2, 28),
('Forte', 3, 28),
('Muito forte', 4, 28),
('Horário fixo para deitar', 1, 30),
('Sem telas 1h antes', 2, 30),
('Quarto escuro e silencioso', 3, 30),
('Sem cafeína após 16h', 4, 30),
('Atividade física leve', 5, 30),
('Jantar leve', 6, 30),
('Não', 1, 32),
('1 vez', 2, 32),
('2 ou mais vezes', 3, 32),
('Caminhada', 1, 40),
('Meditação guiada', 2, 40),
('Encontrar amigos', 3, 40),
('Hobby criativo', 4, 40),
('Leitura', 5, 40),
('Tempo ao ar livre', 6, 40);

INSERT INTO tbl_tarefa_destinatario (prazo, status, data_conclusao, id_tarefa, id_paciente) VALUES
('2026-11-12 23:59:00', 'concluida', '2026-11-05 20:10:00', 16, 6),
('2026-11-12 23:59:00', 'concluida', '2026-11-08 21:30:00', 16, 10),
('2026-11-12 23:59:00', 'concluida', '2026-11-10 19:45:00', 16, 14),
('2026-11-12 23:59:00', 'pendente', NULL, 16, 7),
('2026-12-02 23:59:00', 'pendente', NULL, 16, 11),
('2026-12-02 23:59:00', 'pendente', NULL, 16, 15),
('2026-11-14 23:59:00', 'concluida', '2026-11-09 22:00:00', 17, 8),
('2026-11-14 23:59:00', 'concluida', '2026-11-11 21:15:00', 17, 9),
('2026-11-18 23:59:00', 'pendente', NULL, 17, 12),
('2026-11-30 23:59:00', 'pendente', NULL, 17, 13),
('2026-11-30 23:59:00', 'pendente', NULL, 17, 17),
('2026-11-16 23:59:00', 'concluida', '2026-11-15 08:20:00', 18, 8),
('2026-11-16 23:59:00', 'concluida', '2026-11-14 07:50:00', 18, 11),
('2026-12-01 23:59:00', 'pendente', NULL, 18, 6),
('2026-12-01 23:59:00', 'pendente', NULL, 18, 10),
('2026-11-20 23:59:00', 'pendente', NULL, 18, 14),
('2026-11-20 23:59:00', 'concluida', '2026-11-18 20:40:00', 19, 15),
('2026-12-05 23:59:00', 'pendente', NULL, 19, 9),
('2026-12-05 23:59:00', 'pendente', NULL, 19, 17),
('2026-11-22 23:59:00', 'concluida', '2026-11-22 20:00:00', 20, 6),
('2026-11-22 23:59:00', 'concluida', '2026-11-21 21:30:00', 20, 7),
('2026-11-22 23:59:00', 'concluida', '2026-11-22 22:10:00', 20, 8),
('2026-11-22 23:59:00', 'concluida', '2026-11-20 19:45:00', 20, 9),
('2026-11-22 23:59:00', 'pendente', NULL, 20, 10),
('2026-11-22 23:59:00', 'concluida', '2026-11-22 18:25:00', 20, 11),
('2026-11-22 23:59:00', 'pendente', NULL, 20, 12),
('2026-11-22 23:59:00', 'concluida', '2026-11-21 20:05:00', 20, 13),
('2026-11-29 23:59:00', 'pendente', NULL, 20, 14),
('2026-11-22 23:59:00', 'concluida', '2026-11-22 21:00:00', 20, 15),
('2026-11-29 23:59:00', 'pendente', NULL, 20, 17),
('2026-11-28 23:59:00', 'concluida', '2026-11-23 20:30:00', 21, 7),
('2026-11-28 23:59:00', 'pendente', NULL, 21, 12),
('2026-12-03 23:59:00', 'pendente', NULL, 21, 13),
('2026-11-27 23:59:00', 'pendente', NULL, 23, 6),
('2026-11-23 23:59:00', 'concluida', '2026-11-22 18:00:00', 24, 9),
('2026-11-30 23:59:00', 'pendente', NULL, 25, 15);

INSERT INTO tbl_resposta (valor, data_envio, id_pergunta, id_opcao_pergunta, id_tarefa_destinatario) VALUES
(NULL, '2026-11-05 20:10:00', 22, 37, 19),
(NULL, '2026-11-05 20:10:00', 23, 41, 19),
(NULL, '2026-11-05 20:10:00', 24, 45, 19),
('Conversei com um amigo e me senti ouvido(a).', '2026-11-05 20:10:00', 25, NULL, 19),
(NULL, '2026-11-08 21:30:00', 22, 36, 20),
(NULL, '2026-11-08 21:30:00', 23, 41, 20),
(NULL, '2026-11-08 21:30:00', 24, 45, 20),
('Conversei com um amigo e me senti ouvido(a).', '2026-11-08 21:30:00', 25, NULL, 20),
(NULL, '2026-11-10 19:45:00', 22, 34, 21),
(NULL, '2026-11-10 19:45:00', 23, 39, 21),
(NULL, '2026-11-10 19:45:00', 24, 43, 21),
('Uma reunião em que me cobraram na frente de todos.', '2026-11-10 19:45:00', 25, NULL, 21),
('Conversei com um amigo e me senti ouvido(a).', '2026-11-09 22:00:00', 26, NULL, 25),
('Discuti com um familiar e fiquei remoendo.', '2026-11-09 22:00:00', 27, NULL, 25),
(NULL, '2026-11-09 22:00:00', 28, 49, 25),
('Ainda me sinto cansado(a), mas com mais ânimo à noite.', '2026-11-09 22:00:00', 29, NULL, 25),
('Acordei já preocupado(a) com o dia.', '2026-11-11 21:15:00', 26, NULL, 26),
('Ainda me sinto cansado(a), mas com mais ânimo à noite.', '2026-11-11 21:15:00', 27, NULL, 26),
(NULL, '2026-11-11 21:15:00', 28, 47, 26),
('Discuti com um familiar e fiquei remoendo.', '2026-11-11 21:15:00', 29, NULL, 26),
(NULL, '2026-11-15 08:20:00', 30, 53, 30),
(NULL, '2026-11-15 08:20:00', 30, 54, 30),
(NULL, '2026-11-15 08:20:00', 30, 55, 30),
('8', '2026-11-15 08:20:00', 31, NULL, 30),
(NULL, '2026-11-15 08:20:00', 32, 58, 30),
(NULL, '2026-11-14 07:50:00', 30, 53, 31),
(NULL, '2026-11-14 07:50:00', 30, 54, 31),
('8', '2026-11-14 07:50:00', 31, NULL, 31),
(NULL, '2026-11-14 07:50:00', 32, 57, 31),
('Conversei com um amigo e me senti ouvido(a).', '2026-11-18 20:40:00', 33, NULL, 35),
('Conversei com um amigo e me senti ouvido(a).', '2026-11-18 20:40:00', 34, NULL, 35),
('Ainda me sinto cansado(a), mas com mais ânimo à noite.', '2026-11-18 20:40:00', 35, NULL, 35),
('9', '2026-11-18 20:40:00', 36, NULL, 35),
('mal', '2026-11-22 20:00:00', 37, NULL, 38),
('6', '2026-11-22 20:00:00', 38, NULL, 38),
('Percebi que estou me comparando com os outros o tempo todo.', '2026-11-22 20:00:00', 39, NULL, 38),
('neutro', '2026-11-21 21:30:00', 37, NULL, 39),
('9', '2026-11-21 21:30:00', 38, NULL, 39),
('Tive uma semana corrida, mas consegui reservar um tempo para mim.', '2026-11-21 21:30:00', 39, NULL, 39),
('bem', '2026-11-22 22:10:00', 37, NULL, 40),
('3', '2026-11-22 22:10:00', 38, NULL, 40),
('Acordei já preocupado(a) com o dia.', '2026-11-22 22:10:00', 39, NULL, 40),
('mal', '2026-11-20 19:45:00', 37, NULL, 41),
('9', '2026-11-20 19:45:00', 38, NULL, 41),
('Conversei com um amigo e me senti ouvido(a).', '2026-11-20 19:45:00', 39, NULL, 41),
('mal', '2026-11-22 18:25:00', 37, NULL, 43),
('5', '2026-11-22 18:25:00', 38, NULL, 43),
('Percebi que estou me comparando com os outros o tempo todo.', '2026-11-22 18:25:00', 39, NULL, 43),
('neutro', '2026-11-21 20:05:00', 37, NULL, 45),
('8', '2026-11-21 20:05:00', 38, NULL, 45),
('Ainda me sinto cansado(a), mas com mais ânimo à noite.', '2026-11-21 20:05:00', 39, NULL, 45),
('mal', '2026-11-22 21:00:00', 37, NULL, 47),
('7', '2026-11-22 21:00:00', 38, NULL, 47),
('Ainda me sinto cansado(a), mas com mais ânimo à noite.', '2026-11-22 21:00:00', 39, NULL, 47),
(NULL, '2026-11-23 20:30:00', 40, 59, 49),
(NULL, '2026-11-23 20:30:00', 40, 63, 49),
('Tive uma semana corrida, mas consegui reservar um tempo para mim.', '2026-11-23 20:30:00', 41, NULL, 49);


-- ------------------------------------------------------------
-- REGISTROS DE HUMOR de 03/11 a 25/11 dos pacientes da Ana (completa as datas que ainda não existem)
-- ------------------------------------------------------------
INSERT INTO tbl_registro_humor (data, sentimento, energia, humor, padrao_pensamentos, horas_sono, relato, data_criacao, id_paciente) VALUES
('2026-11-03', 'Calmo', 'Média', 'Neutro', 'Neutros', 8.25, 'Cansaço no fim do dia.', '2026-11-03 21:53:00', 6),
('2026-11-04', 'Feliz', 'Alta', 'Bem', 'Positivos', 9.0, NULL, '2026-11-04 20:12:00', 6),
('2026-11-05', 'Calmo', 'Média', 'Bem', 'Positivos', 7.25, 'Consegui caminhar e me senti melhor.', '2026-11-05 21:37:00', 6),
('2026-11-06', 'Cansado', 'Média', 'Neutro', 'Neutros', 8.0, NULL, '2026-11-06 20:39:00', 6),
('2026-11-07', 'Ansioso', 'Baixa', 'Mal', 'Negativos', 6.5, 'Discuti com um familiar.', '2026-11-07 21:42:00', 6),
('2026-11-08', 'Calmo', 'Alta', 'Neutro', 'Neutros', 7.75, NULL, '2026-11-08 22:08:00', 6),
('2026-11-09', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 7.0, 'Cansaço no fim do dia.', '2026-11-09 22:10:00', 6),
('2026-11-10', 'Feliz', 'Alta', 'Bem', 'Positivos', 8.5, NULL, '2026-11-10 21:51:00', 6),
('2026-11-11', 'Irritado', 'Baixa', 'Mal', 'Negativos', 7.5, 'Dormi mal e acordei com preocupação.', '2026-11-11 20:53:00', 6),
('2026-11-12', 'Cansado', 'Média', 'Neutro', 'Neutros', 6.5, NULL, '2026-11-12 22:30:00', 6),
('2026-11-13', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 6.25, 'Dia normal, sem grandes novidades.', '2026-11-13 22:39:00', 6),
('2026-11-14', 'Feliz', 'Alta', 'Bem', 'Positivos', 6.5, NULL, '2026-11-14 21:38:00', 6),
('2026-11-15', 'Cansado', 'Média', 'Neutro', 'Neutros', 7.75, NULL, '2026-11-15 22:58:00', 6),
('2026-11-16', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 7.5, NULL, '2026-11-16 22:12:00', 6),
('2026-11-24', 'Calmo', 'Média', 'Bem', 'Positivos', 8.25, 'Consegui caminhar e me senti melhor.', '2026-11-24 22:54:00', 6),
('2026-11-03', 'Ansioso', 'Média', 'Mal', 'Negativos', 5.75, NULL, '2026-11-03 21:11:00', 7),
('2026-11-04', 'Irritado', 'Média', 'Mal', 'Negativos', 5.75, NULL, '2026-11-04 21:11:00', 7),
('2026-11-05', 'Ansioso', 'Baixa', 'Mal', 'Negativos', 6.25, 'Discuti com um familiar.', '2026-11-05 20:00:00', 7),
('2026-11-06', 'Feliz', 'Média', 'Bem', 'Positivos', 8.75, NULL, '2026-11-06 20:22:00', 7),
('2026-11-07', 'Ansioso', 'Média', 'Neutro', 'Neutros', 6.5, NULL, '2026-11-07 20:39:00', 7),
('2026-11-08', 'Cansado', 'Alta', 'Neutro', 'Neutros', 7.25, NULL, '2026-11-08 21:36:00', 7),
('2026-11-09', 'Ansioso', 'Média', 'Mal', 'Negativos', 6.5, 'Discuti com um familiar.', '2026-11-09 20:06:00', 7),
('2026-11-10', 'Cansado', 'Alta', 'Neutro', 'Neutros', 7.75, NULL, '2026-11-10 22:06:00', 7),
('2026-11-11', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 6.25, NULL, '2026-11-11 20:16:00', 7),
('2026-11-12', 'Irritado', 'Média', 'Mal', 'Negativos', 4.75, NULL, '2026-11-12 20:03:00', 7),
('2026-11-13', 'Irritado', 'Média', 'Mal', 'Negativos', 4.75, 'Discuti com um familiar.', '2026-11-13 22:40:00', 7),
('2026-11-14', 'Calmo', 'Alta', 'Neutro', 'Neutros', 7.25, NULL, '2026-11-14 20:38:00', 7),
('2026-11-15', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 8.5, NULL, '2026-11-15 22:43:00', 7),
('2026-11-16', 'Calmo', 'Alta', 'Bem', 'Positivos', 6.75, 'Conversei com um amigo e foi bom.', '2026-11-16 20:18:00', 7),
('2026-11-23', 'Calmo', 'Alta', 'Bem', 'Positivos', 7.0, NULL, '2026-11-23 21:20:00', 7),
('2026-11-24', 'Calmo', 'Média', 'Bem', 'Positivos', 6.0, NULL, '2026-11-24 22:07:00', 7),
('2026-11-25', 'Ansioso', 'Alta', 'Neutro', 'Neutros', 5.75, 'Cansaço no fim do dia.', '2026-11-25 22:19:00', 7),
('2026-11-03', 'Irritado', 'Baixa', 'Mal', 'Negativos', 6.75, 'Discuti com um familiar.', '2026-11-03 21:42:00', 8),
('2026-11-04', 'Triste', 'Média', 'Mal', 'Negativos', 5.25, NULL, '2026-11-04 21:50:00', 8),
('2026-11-05', 'Irritado', 'Média', 'Mal', 'Negativos', 4.75, 'Discuti com um familiar.', '2026-11-05 21:08:00', 8),
('2026-11-06', 'Calmo', 'Alta', 'Bem', 'Positivos', 8.0, NULL, '2026-11-06 21:40:00', 8),
('2026-11-07', 'Ansioso', 'Média', 'Neutro', 'Neutros', 7.75, 'Dia normal, sem grandes novidades.', '2026-11-07 21:03:00', 8),
('2026-11-08', 'Feliz', 'Alta', 'Bem', 'Positivos', 8.25, NULL, '2026-11-08 20:35:00', 8),
('2026-11-09', 'Feliz', 'Alta', 'Bem', 'Positivos', 7.0, 'Conversei com um amigo e foi bom.', '2026-11-09 22:51:00', 8),
('2026-11-10', 'Cansado', 'Média', 'Neutro', 'Neutros', 8.0, NULL, '2026-11-10 22:26:00', 8),
('2026-11-11', 'Triste', 'Média', 'Mal', 'Negativos', 7.75, NULL, '2026-11-11 20:40:00', 8),
('2026-11-12', 'Irritado', 'Baixa', 'Mal', 'Negativos', 5.75, NULL, '2026-11-12 22:47:00', 8),
('2026-11-13', 'Triste', 'Média', 'Mal', 'Negativos', 7.75, NULL, '2026-11-13 22:02:00', 8),
('2026-11-14', 'Calmo', 'Média', 'Bem', 'Positivos', 7.25, NULL, '2026-11-14 20:09:00', 8),
('2026-11-15', 'Calmo', 'Média', 'Bem', 'Positivos', 7.0, 'Consegui caminhar e me senti melhor.', '2026-11-15 21:18:00', 8),
('2026-11-16', 'Cansado', 'Alta', 'Neutro', 'Neutros', 6.5, NULL, '2026-11-16 22:00:00', 8),
('2026-11-22', 'Feliz', 'Média', 'Bem', 'Positivos', 8.0, NULL, '2026-11-22 22:33:00', 8),
('2026-11-23', 'Ansioso', 'Baixa', 'Mal', 'Negativos', 5.75, 'Dormi mal e acordei com preocupação.', '2026-11-23 21:04:00', 8),
('2026-11-24', 'Cansado', 'Média', 'Neutro', 'Neutros', 6.0, 'Dia normal, sem grandes novidades.', '2026-11-24 21:31:00', 8),
('2026-11-25', 'Triste', 'Média', 'Mal', 'Negativos', 7.5, 'Discuti com um familiar.', '2026-11-25 22:07:00', 8),
('2026-11-03', 'Calmo', 'Alta', 'Neutro', 'Neutros', 8.25, 'Dia normal, sem grandes novidades.', '2026-11-03 21:58:00', 9),
('2026-11-04', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 5.75, NULL, '2026-11-04 21:16:00', 9),
('2026-11-05', 'Feliz', 'Alta', 'Bem', 'Positivos', 6.75, 'Conversei com um amigo e foi bom.', '2026-11-05 21:20:00', 9),
('2026-11-06', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 8.0, 'Cansaço no fim do dia.', '2026-11-06 22:24:00', 9),
('2026-11-07', 'Ansioso', 'Média', 'Neutro', 'Neutros', 6.75, NULL, '2026-11-07 21:17:00', 9),
('2026-11-08', 'Calmo', 'Média', 'Neutro', 'Neutros', 5.75, 'Cansaço no fim do dia.', '2026-11-08 22:40:00', 9),
('2026-11-09', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 6.5, 'Dia normal, sem grandes novidades.', '2026-11-09 22:29:00', 9),
('2026-11-10', 'Feliz', 'Alta', 'Bem', 'Positivos', 7.25, NULL, '2026-11-10 21:06:00', 9),
('2026-11-11', 'Calmo', 'Alta', 'Bem', 'Positivos', 9.0, NULL, '2026-11-11 21:41:00', 9),
('2026-11-12', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 8.25, NULL, '2026-11-12 22:44:00', 9),
('2026-11-13', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 6.5, NULL, '2026-11-13 21:21:00', 9),
('2026-11-14', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 7.75, NULL, '2026-11-14 21:01:00', 9),
('2026-11-15', 'Feliz', 'Média', 'Bem', 'Positivos', 8.5, NULL, '2026-11-15 22:44:00', 9),
('2026-11-16', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 7.75, NULL, '2026-11-16 20:29:00', 9),
('2026-11-24', 'Cansado', 'Alta', 'Neutro', 'Neutros', 7.5, NULL, '2026-11-24 21:45:00', 9),
('2026-11-03', 'Irritado', 'Média', 'Mal', 'Negativos', 6.75, 'Dormi mal e acordei com preocupação.', '2026-11-03 20:11:00', 10),
('2026-11-04', 'Triste', 'Média', 'Mal', 'Negativos', 6.5, 'Discuti com um familiar.', '2026-11-04 21:22:00', 10),
('2026-11-05', 'Irritado', 'Média', 'Mal', 'Negativos', 6.25, NULL, '2026-11-05 20:41:00', 10),
('2026-11-06', 'Irritado', 'Média', 'Mal', 'Negativos', 4.75, NULL, '2026-11-06 20:23:00', 10),
('2026-11-07', 'Triste', 'Baixa', 'Mal', 'Negativos', 7.5, 'Dormi mal e acordei com preocupação.', '2026-11-07 21:55:00', 10),
('2026-11-08', 'Triste', 'Média', 'Mal', 'Negativos', 7.0, NULL, '2026-11-08 21:39:00', 10),
('2026-11-09', 'Irritado', 'Média', 'Mal', 'Negativos', 6.5, NULL, '2026-11-09 21:42:00', 10),
('2026-11-10', 'Ansioso', 'Média', 'Mal', 'Negativos', 5.5, NULL, '2026-11-10 22:33:00', 10),
('2026-11-11', 'Calmo', 'Média', 'Bem', 'Positivos', 8.0, NULL, '2026-11-11 21:15:00', 10),
('2026-11-12', 'Triste', 'Baixa', 'Mal', 'Negativos', 6.5, NULL, '2026-11-12 21:49:00', 10),
('2026-11-13', 'Feliz', 'Alta', 'Bem', 'Positivos', 7.5, NULL, '2026-11-13 22:25:00', 10),
('2026-11-14', 'Ansioso', 'Média', 'Neutro', 'Neutros', 7.75, 'Dia normal, sem grandes novidades.', '2026-11-14 20:51:00', 10),
('2026-11-15', 'Feliz', 'Alta', 'Bem', 'Positivos', 8.0, 'Consegui caminhar e me senti melhor.', '2026-11-15 20:08:00', 10),
('2026-11-16', 'Cansado', 'Média', 'Neutro', 'Neutros', 7.25, 'Cansaço no fim do dia.', '2026-11-16 22:03:00', 10),
('2026-11-23', 'Calmo', 'Alta', 'Bem', 'Positivos', 8.25, 'Conversei com um amigo e foi bom.', '2026-11-23 20:32:00', 10),
('2026-11-24', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 7.25, NULL, '2026-11-24 20:57:00', 10),
('2026-11-25', 'Cansado', 'Média', 'Neutro', 'Neutros', 7.75, 'Dia normal, sem grandes novidades.', '2026-11-25 21:37:00', 10),
('2026-11-03', 'Calmo', 'Média', 'Neutro', 'Neutros', 7.75, NULL, '2026-11-03 20:32:00', 11),
('2026-11-04', 'Ansioso', 'Baixa', 'Mal', 'Negativos', 7.5, 'Discuti com um familiar.', '2026-11-04 20:14:00', 11),
('2026-11-05', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 7.0, 'Cansaço no fim do dia.', '2026-11-05 21:54:00', 11),
('2026-11-06', 'Triste', 'Média', 'Mal', 'Negativos', 5.5, 'Discuti com um familiar.', '2026-11-06 20:56:00', 11),
('2026-11-07', 'Feliz', 'Média', 'Bem', 'Positivos', 8.25, 'Consegui caminhar e me senti melhor.', '2026-11-07 20:11:00', 11),
('2026-11-08', 'Irritado', 'Baixa', 'Mal', 'Negativos', 6.25, NULL, '2026-11-08 22:09:00', 11),
('2026-11-09', 'Calmo', 'Alta', 'Neutro', 'Neutros', 8.25, NULL, '2026-11-09 21:25:00', 11),
('2026-11-10', 'Irritado', 'Média', 'Mal', 'Negativos', 6.5, NULL, '2026-11-10 20:06:00', 11),
('2026-11-11', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 7.25, NULL, '2026-11-11 22:40:00', 11),
('2026-11-12', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 8.5, NULL, '2026-11-12 22:05:00', 11),
('2026-11-13', 'Ansioso', 'Alta', 'Neutro', 'Neutros', 6.5, NULL, '2026-11-13 20:52:00', 11),
('2026-11-14', 'Ansioso', 'Média', 'Mal', 'Negativos', 5.0, NULL, '2026-11-14 22:06:00', 11),
('2026-11-15', 'Calmo', 'Alta', 'Neutro', 'Neutros', 7.5, NULL, '2026-11-15 21:34:00', 11),
('2026-11-16', 'Irritado', 'Baixa', 'Mal', 'Negativos', 7.75, 'Dormi mal e acordei com preocupação.', '2026-11-16 20:34:00', 11),
('2026-11-22', 'Calmo', 'Alta', 'Bem', 'Positivos', 6.0, 'Consegui caminhar e me senti melhor.', '2026-11-22 22:09:00', 11),
('2026-11-23', 'Ansioso', 'Média', 'Neutro', 'Neutros', 7.0, 'Cansaço no fim do dia.', '2026-11-23 21:15:00', 11),
('2026-11-24', 'Cansado', 'Alta', 'Neutro', 'Neutros', 8.0, 'Cansaço no fim do dia.', '2026-11-24 20:28:00', 11),
('2026-11-25', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 5.75, NULL, '2026-11-25 22:01:00', 11),
('2026-11-03', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 6.0, NULL, '2026-11-03 20:18:00', 12),
('2026-11-04', 'Ansioso', 'Alta', 'Neutro', 'Neutros', 7.0, 'Cansaço no fim do dia.', '2026-11-04 20:22:00', 12),
('2026-11-05', 'Calmo', 'Alta', 'Bem', 'Positivos', 7.75, NULL, '2026-11-05 20:37:00', 12),
('2026-11-06', 'Ansioso', 'Média', 'Mal', 'Negativos', 5.25, 'Dormi mal e acordei com preocupação.', '2026-11-06 21:00:00', 12),
('2026-11-07', 'Cansado', 'Alta', 'Neutro', 'Neutros', 5.5, NULL, '2026-11-07 21:58:00', 12),
('2026-11-08', 'Cansado', 'Média', 'Neutro', 'Neutros', 6.25, NULL, '2026-11-08 22:53:00', 12),
('2026-11-09', 'Calmo', 'Alta', 'Bem', 'Positivos', 8.25, 'Conversei com um amigo e foi bom.', '2026-11-09 22:29:00', 12),
('2026-11-10', 'Calmo', 'Alta', 'Bem', 'Positivos', 7.75, NULL, '2026-11-10 20:18:00', 12),
('2026-11-11', 'Irritado', 'Baixa', 'Mal', 'Negativos', 7.0, 'Dormi mal e acordei com preocupação.', '2026-11-11 21:59:00', 12),
('2026-11-12', 'Cansado', 'Alta', 'Neutro', 'Neutros', 8.25, NULL, '2026-11-12 22:33:00', 12),
('2026-11-13', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 6.25, NULL, '2026-11-13 20:34:00', 12),
('2026-11-14', 'Calmo', 'Alta', 'Neutro', 'Neutros', 5.75, 'Cansaço no fim do dia.', '2026-11-14 20:28:00', 12),
('2026-11-15', 'Feliz', 'Alta', 'Bem', 'Positivos', 6.5, 'Consegui caminhar e me senti melhor.', '2026-11-15 21:41:00', 12),
('2026-11-16', 'Calmo', 'Média', 'Bem', 'Positivos', 7.5, 'Consegui caminhar e me senti melhor.', '2026-11-16 21:55:00', 12),
('2026-11-24', 'Calmo', 'Média', 'Bem', 'Positivos', 8.25, 'Conversei com um amigo e foi bom.', '2026-11-24 20:52:00', 12),
('2026-11-03', 'Calmo', 'Alta', 'Neutro', 'Neutros', 8.5, NULL, '2026-11-03 22:21:00', 13),
('2026-11-04', 'Ansioso', 'Média', 'Neutro', 'Neutros', 6.5, NULL, '2026-11-04 22:16:00', 13),
('2026-11-05', 'Triste', 'Baixa', 'Mal', 'Negativos', 6.0, 'Discuti com um familiar.', '2026-11-05 21:47:00', 13),
('2026-11-06', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 8.5, 'Dia normal, sem grandes novidades.', '2026-11-06 22:06:00', 13),
('2026-11-07', 'Ansioso', 'Alta', 'Neutro', 'Neutros', 7.0, NULL, '2026-11-07 22:30:00', 13),
('2026-11-08', 'Irritado', 'Baixa', 'Mal', 'Negativos', 5.25, NULL, '2026-11-08 21:16:00', 13),
('2026-11-09', 'Irritado', 'Baixa', 'Mal', 'Negativos', 6.75, NULL, '2026-11-09 21:37:00', 13),
('2026-11-10', 'Irritado', 'Média', 'Mal', 'Negativos', 5.5, 'Dormi mal e acordei com preocupação.', '2026-11-10 21:49:00', 13),
('2026-11-11', 'Ansioso', 'Alta', 'Neutro', 'Neutros', 8.5, 'Cansaço no fim do dia.', '2026-11-11 21:30:00', 13),
('2026-11-12', 'Cansado', 'Média', 'Neutro', 'Neutros', 6.5, 'Dia normal, sem grandes novidades.', '2026-11-12 22:18:00', 13),
('2026-11-13', 'Calmo', 'Média', 'Bem', 'Positivos', 8.5, 'Conversei com um amigo e foi bom.', '2026-11-13 20:24:00', 13),
('2026-11-14', 'Ansioso', 'Média', 'Mal', 'Negativos', 5.75, NULL, '2026-11-14 22:34:00', 13),
('2026-11-15', 'Calmo', 'Média', 'Bem', 'Positivos', 8.25, 'Conversei com um amigo e foi bom.', '2026-11-15 22:19:00', 13),
('2026-11-16', 'Irritado', 'Baixa', 'Mal', 'Negativos', 6.75, 'Dormi mal e acordei com preocupação.', '2026-11-16 21:24:00', 13),
('2026-11-23', 'Calmo', 'Alta', 'Bem', 'Positivos', 8.25, NULL, '2026-11-23 22:19:00', 13),
('2026-11-24', 'Feliz', 'Alta', 'Bem', 'Positivos', 6.75, NULL, '2026-11-24 21:48:00', 13),
('2026-11-25', 'Calmo', 'Alta', 'Neutro', 'Neutros', 6.0, 'Cansaço no fim do dia.', '2026-11-25 21:54:00', 13),
('2026-11-03', 'Feliz', 'Média', 'Bem', 'Positivos', 6.75, NULL, '2026-11-03 20:15:00', 14),
('2026-11-04', 'Irritado', 'Baixa', 'Mal', 'Negativos', 6.25, 'Dormi mal e acordei com preocupação.', '2026-11-04 21:01:00', 14),
('2026-11-05', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 8.5, 'Cansaço no fim do dia.', '2026-11-05 22:22:00', 14),
('2026-11-06', 'Calmo', 'Média', 'Neutro', 'Neutros', 8.5, NULL, '2026-11-06 21:19:00', 14),
('2026-11-07', 'Calmo', 'Alta', 'Bem', 'Positivos', 6.25, 'Conversei com um amigo e foi bom.', '2026-11-07 22:26:00', 14),
('2026-11-08', 'Triste', 'Média', 'Mal', 'Negativos', 5.25, NULL, '2026-11-08 21:38:00', 14),
('2026-11-09', 'Irritado', 'Baixa', 'Mal', 'Negativos', 5.0, 'Discuti com um familiar.', '2026-11-09 22:50:00', 14),
('2026-11-10', 'Feliz', 'Alta', 'Bem', 'Positivos', 8.5, 'Consegui caminhar e me senti melhor.', '2026-11-10 20:28:00', 14),
('2026-11-11', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 6.75, 'Dia normal, sem grandes novidades.', '2026-11-11 20:27:00', 14),
('2026-11-12', 'Calmo', 'Alta', 'Bem', 'Positivos', 6.75, NULL, '2026-11-12 20:22:00', 14),
('2026-11-13', 'Feliz', 'Alta', 'Bem', 'Positivos', 6.0, 'Conversei com um amigo e foi bom.', '2026-11-13 20:44:00', 14),
('2026-11-14', 'Ansioso', 'Alta', 'Neutro', 'Neutros', 8.5, 'Dia normal, sem grandes novidades.', '2026-11-14 21:20:00', 14),
('2026-11-15', 'Cansado', 'Alta', 'Neutro', 'Neutros', 7.25, NULL, '2026-11-15 22:33:00', 14),
('2026-11-16', 'Ansioso', 'Baixa', 'Neutro', 'Neutros', 6.75, 'Cansaço no fim do dia.', '2026-11-16 21:26:00', 14),
('2026-11-22', 'Calmo', 'Alta', 'Bem', 'Positivos', 8.75, 'Conversei com um amigo e foi bom.', '2026-11-22 22:19:00', 14),
('2026-11-23', 'Feliz', 'Alta', 'Muito bem', 'Positivos', 7.5, NULL, '2026-11-23 20:38:00', 14),
('2026-11-24', 'Calmo', 'Alta', 'Bem', 'Positivos', 8.25, NULL, '2026-11-24 21:41:00', 14),
('2026-11-25', 'Feliz', 'Alta', 'Bem', 'Positivos', 7.5, 'Consegui caminhar e me senti melhor.', '2026-11-25 22:28:00', 14),
('2026-11-03', 'Calmo', 'Alta', 'Neutro', 'Neutros', 7.25, 'Cansaço no fim do dia.', '2026-11-03 21:50:00', 15),
('2026-11-04', 'Ansioso', 'Baixa', 'Mal', 'Negativos', 6.25, 'Discuti com um familiar.', '2026-11-04 22:18:00', 15),
('2026-11-05', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 7.25, 'Cansaço no fim do dia.', '2026-11-05 21:19:00', 15),
('2026-11-06', 'Calmo', 'Média', 'Bem', 'Positivos', 9.0, 'Consegui caminhar e me senti melhor.', '2026-11-06 20:14:00', 15),
('2026-11-07', 'Triste', 'Média', 'Mal', 'Negativos', 7.0, NULL, '2026-11-07 20:43:00', 15),
('2026-11-08', 'Calmo', 'Média', 'Neutro', 'Neutros', 7.0, NULL, '2026-11-08 20:55:00', 15),
('2026-11-09', 'Cansado', 'Média', 'Neutro', 'Neutros', 5.75, NULL, '2026-11-09 22:55:00', 15),
('2026-11-10', 'Feliz', 'Alta', 'Bem', 'Positivos', 7.25, 'Consegui caminhar e me senti melhor.', '2026-11-10 21:35:00', 15),
('2026-11-11', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 8.0, 'Dia normal, sem grandes novidades.', '2026-11-11 20:17:00', 15),
('2026-11-12', 'Ansioso', 'Média', 'Neutro', 'Neutros', 8.5, 'Cansaço no fim do dia.', '2026-11-12 20:29:00', 15),
('2026-11-13', 'Calmo', 'Média', 'Bem', 'Positivos', 7.25, NULL, '2026-11-13 21:49:00', 15),
('2026-11-14', 'Feliz', 'Média', 'Bem', 'Positivos', 8.5, 'Conversei com um amigo e foi bom.', '2026-11-14 20:20:00', 15),
('2026-11-15', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 8.0, 'Dia normal, sem grandes novidades.', '2026-11-15 21:04:00', 15),
('2026-11-16', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 8.5, NULL, '2026-11-16 22:42:00', 15),
('2026-11-24', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 7.25, 'Cansaço no fim do dia.', '2026-11-24 22:35:00', 15),
('2026-11-03', 'Irritado', 'Média', 'Mal', 'Negativos', 6.5, NULL, '2026-11-03 20:10:00', 17),
('2026-11-04', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 7.25, NULL, '2026-11-04 22:41:00', 17),
('2026-11-05', 'Calmo', 'Baixa', 'Neutro', 'Neutros', 6.0, NULL, '2026-11-05 20:58:00', 17),
('2026-11-06', 'Calmo', 'Alta', 'Bem', 'Positivos', 6.5, NULL, '2026-11-06 20:46:00', 17),
('2026-11-07', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 7.5, 'Cansaço no fim do dia.', '2026-11-07 21:25:00', 17),
('2026-11-08', 'Calmo', 'Alta', 'Bem', 'Positivos', 9.0, NULL, '2026-11-08 20:16:00', 17),
('2026-11-09', 'Calmo', 'Média', 'Muito bem', 'Positivos', 9.25, 'Me senti leve e com energia.', '2026-11-09 20:44:00', 17),
('2026-11-10', 'Calmo', 'Média', 'Bem', 'Positivos', 6.25, 'Conversei com um amigo e foi bom.', '2026-11-10 22:12:00', 17),
('2026-11-11', 'Feliz', 'Alta', 'Muito bem', 'Positivos', 6.75, NULL, '2026-11-11 22:53:00', 17),
('2026-11-12', 'Calmo', 'Alta', 'Neutro', 'Neutros', 6.25, NULL, '2026-11-12 21:34:00', 17),
('2026-11-13', 'Feliz', 'Alta', 'Bem', 'Positivos', 6.75, 'Conversei com um amigo e foi bom.', '2026-11-13 20:40:00', 17),
('2026-11-14', 'Feliz', 'Alta', 'Bem', 'Positivos', 8.75, 'Conversei com um amigo e foi bom.', '2026-11-14 22:55:00', 17),
('2026-11-15', 'Calmo', 'Alta', 'Bem', 'Positivos', 8.0, NULL, '2026-11-15 21:59:00', 17),
('2026-11-16', 'Feliz', 'Alta', 'Bem', 'Positivos', 8.0, 'Consegui caminhar e me senti melhor.', '2026-11-16 20:45:00', 17),
('2026-11-22', 'Calmo', 'Alta', 'Muito bem', 'Positivos', 9.25, NULL, '2026-11-22 20:27:00', 17),
('2026-11-23', 'Calmo', 'Alta', 'Neutro', 'Neutros', 6.0, NULL, '2026-11-23 20:07:00', 17),
('2026-11-24', 'Cansado', 'Baixa', 'Neutro', 'Neutros', 8.5, NULL, '2026-11-24 22:08:00', 17),
('2026-11-25', 'Calmo', 'Média', 'Muito bem', 'Positivos', 8.75, 'Me senti leve e com energia.', '2026-11-25 21:52:00', 17);


-- ------------------------------------------------------------
-- TRATAMENTOS dos pacientes 8, 10 e 14 (com horários e doses dos últimos dias)
-- ------------------------------------------------------------
INSERT INTO tbl_tratamento (nome_medicamento, dosagem, frequencia, lembrete_ativo, id_paciente) VALUES
('Sertralina', '50 mg', 'Uma vez ao dia', 1, 8),
('Escitalopram', '10 mg', 'Uma vez ao dia', 1, 10),
('Fluoxetina', '20 mg', 'Duas vezes ao dia', 1, 14);

INSERT INTO tbl_horario_tratamento (horario, id_tratamento) VALUES
('08:00:00', 13),
('20:00:00', 14),
('08:00:00', 15),
('20:00:00', 15);

INSERT INTO tbl_registro_dose (data_hora_prevista, status, data_hora_confirmacao, id_horario_tratamento) VALUES
('2026-11-19 08:00:00', 'pendente', NULL, 17),
('2026-11-20 08:00:00', 'tomada', '2026-11-20 08:29:00', 17),
('2026-11-21 08:00:00', 'tomada', '2026-11-21 08:37:00', 17),
('2026-11-22 08:00:00', 'tomada', '2026-11-22 08:29:00', 17),
('2026-11-23 08:00:00', 'tomada', '2026-11-23 08:14:00', 17),
('2026-11-24 08:00:00', 'tomada', '2026-11-24 08:07:00', 17),
('2026-11-25 08:00:00', 'tomada', '2026-11-25 08:27:00', 17),
('2026-11-19 20:00:00', 'tomada', '2026-11-19 20:26:00', 18),
('2026-11-20 20:00:00', 'tomada', '2026-11-20 20:25:00', 18),
('2026-11-21 20:00:00', 'tomada', '2026-11-21 20:15:00', 18),
('2026-11-22 20:00:00', 'tomada', '2026-11-22 20:40:00', 18),
('2026-11-23 20:00:00', 'tomada', '2026-11-23 20:36:00', 18),
('2026-11-24 20:00:00', 'tomada', '2026-11-24 20:40:00', 18),
('2026-11-25 20:00:00', 'pendente', NULL, 18),
('2026-11-19 08:00:00', 'tomada', '2026-11-19 08:38:00', 19),
('2026-11-20 08:00:00', 'tomada', '2026-11-20 08:33:00', 19),
('2026-11-21 08:00:00', 'tomada', '2026-11-21 08:18:00', 19),
('2026-11-22 08:00:00', 'tomada', '2026-11-22 08:22:00', 19),
('2026-11-23 08:00:00', 'tomada', '2026-11-23 08:17:00', 19),
('2026-11-24 08:00:00', 'tomada', '2026-11-24 08:23:00', 19),
('2026-11-25 08:00:00', 'tomada', '2026-11-25 08:37:00', 19),
('2026-11-19 20:00:00', 'tomada', '2026-11-19 20:07:00', 20),
('2026-11-20 20:00:00', 'tomada', '2026-11-20 20:14:00', 20),
('2026-11-21 20:00:00', 'tomada', '2026-11-21 20:19:00', 20),
('2026-11-22 20:00:00', 'tomada', '2026-11-22 20:13:00', 20),
('2026-11-23 20:00:00', 'tomada', '2026-11-23 20:07:00', 20),
('2026-11-24 20:00:00', 'tomada', '2026-11-24 20:31:00', 20),
('2026-11-25 20:00:00', 'pendente', NULL, 20);


-- ------------------------------------------------------------
-- NOTIFICACOES e PREFERENCIAS da Ana (e avisos de nova tarefa para os pacientes)
-- ------------------------------------------------------------
INSERT INTO tbl_preferencia_notificacao (categoria, tipo_especifico, ativo, id_profissional, id_paciente) VALUES
('agenda', 'lembrete_vespera', 1, 1, NULL),
('tarefa', 'tarefa_respondida', 1, 1, NULL),
('agenda', 'nova_consulta', 1, 1, NULL),
('agenda', 'consulta_cancelada', 1, 1, NULL);

INSERT INTO tbl_notificacao (titulo_mensagem, lida, data_criacao, referencia_evento, id_categoria, id_profissional, id_paciente) VALUES
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-06-14 10:00:00', 'solicitacao_vinculo', 4, 1, NULL),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-05-04 09:00:00', 'vinculo_aceito', 4, 1, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-07-19 10:00:00', 'solicitacao_vinculo', 4, 1, NULL),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-04-27 09:00:00', 'vinculo_aceito', 4, 1, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-08-02 10:00:00', 'solicitacao_vinculo', 4, 1, NULL),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-09-14 09:00:00', 'vinculo_aceito', 4, 1, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-06-28 10:00:00', 'solicitacao_vinculo', 4, 1, NULL),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-10-05 09:00:00', 'vinculo_aceito', 4, 1, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 1, '2026-05-17 10:00:00', 'solicitacao_vinculo', 4, 1, NULL),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-08-24 09:00:00', 'vinculo_aceito', 4, 1, NULL),
('O paciente aceitou a sua solicitação de vínculo.', 1, '2026-09-28 09:00:00', 'vinculo_aceito', 4, 1, NULL),
('Você recebeu uma solicitação de vínculo de um paciente.', 0, '2026-11-18 10:45:00', 'solicitacao_vinculo', 4, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-05 20:10:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-08 21:30:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-10 19:45:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-09 22:00:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-11 21:15:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-15 08:20:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 1, '2026-11-14 07:50:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-18 20:40:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-22 20:00:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-21 21:30:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-22 22:10:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-20 19:45:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-22 18:25:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-21 20:05:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-22 21:00:00', 'tarefa_respondida', 3, 1, NULL),
('Um paciente respondeu a uma tarefa.', 0, '2026-11-23 20:30:00', 'tarefa_respondida', 3, 1, NULL),
('A consulta de 30/11/2026 às 09:00 foi cancelada.', 0, '2026-11-23 15:00:00', 'consulta_cancelada:54', 2, 1, NULL),
('Nova consulta agendada para 30/11/2026 às 10:00.', 0, '2026-11-24 12:00:00', 'nova_consulta:65', 7, 1, NULL),
('A consulta de 21/12/2026 às 10:00 foi cancelada.', 0, '2026-11-23 15:00:00', 'consulta_cancelada:68', 2, 1, NULL),
('A consulta de 17/11/2026 às 16:00 foi cancelada.', 1, '2026-11-23 15:00:00', 'consulta_cancelada:84', 2, 1, NULL),
('A consulta de 05/11/2026 às 14:00 foi cancelada.', 1, '2026-11-23 15:00:00', 'consulta_cancelada:112', 2, 1, NULL),
('Amanhã (26/11/2026) você atende Felipe às 14:00.', 0, '2026-11-25 08:00:00', 'lembrete_vespera:115', 9, 1, NULL),
('Nova consulta agendada para 27/11/2026 às 08:00.', 0, '2026-11-24 12:00:00', 'nova_consulta:135', 7, 1, NULL),
('A consulta de 18/12/2026 às 08:00 foi cancelada.', 0, '2026-11-23 15:00:00', 'consulta_cancelada:138', 2, 1, NULL),
('Nova consulta agendada para 28/11/2026 às 09:00.', 0, '2026-11-24 12:00:00', 'nova_consulta:150', 7, 1, NULL),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-02 09:00:00', 'nova_tarefa', 3, NULL, 6),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-02 09:00:00', 'nova_tarefa', 3, NULL, 10),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-02 09:00:00', 'nova_tarefa', 3, NULL, 14),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-02 09:00:00', 'nova_tarefa', 3, NULL, 7),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-02 09:00:00', 'nova_tarefa', 3, NULL, 11),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-02 09:00:00', 'nova_tarefa', 3, NULL, 15),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-04 10:00:00', 'nova_tarefa', 3, NULL, 8),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-04 10:00:00', 'nova_tarefa', 3, NULL, 9),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-04 10:00:00', 'nova_tarefa', 3, NULL, 12),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-04 10:00:00', 'nova_tarefa', 3, NULL, 13),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-04 10:00:00', 'nova_tarefa', 3, NULL, 17),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-09 08:00:00', 'nova_tarefa', 3, NULL, 8),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-09 08:00:00', 'nova_tarefa', 3, NULL, 11),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-09 08:00:00', 'nova_tarefa', 3, NULL, 6),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-09 08:00:00', 'nova_tarefa', 3, NULL, 10),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-09 08:00:00', 'nova_tarefa', 3, NULL, 14),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-11 15:00:00', 'nova_tarefa', 3, NULL, 15),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-11 15:00:00', 'nova_tarefa', 3, NULL, 9),
('Uma nova tarefa foi atribuída pelo profissional.', 1, '2026-11-11 15:00:00', 'nova_tarefa', 3, NULL, 17),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 6),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 7),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 8),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 9),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 10),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 11),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 12),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 13),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 14),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 15),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-15 18:00:00', 'nova_tarefa', 3, NULL, 17),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-18 11:00:00', 'nova_tarefa', 3, NULL, 7),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-18 11:00:00', 'nova_tarefa', 3, NULL, 12),
('Uma nova tarefa foi atribuída pelo profissional.', 0, '2026-11-18 11:00:00', 'nova_tarefa', 3, NULL, 13);



-- ============================================================
-- CONFERENCIA (rode depois dos inserts: tudo deve estar coerente)
-- ============================================================
SELECT 'usuarios' AS tabela, COUNT(*) AS total FROM tbl_usuario
UNION ALL SELECT 'administradores', COUNT(*) FROM tbl_administrador
UNION ALL SELECT 'profissionais', COUNT(*) FROM tbl_profissional
UNION ALL SELECT 'pacientes', COUNT(*) FROM tbl_paciente
UNION ALL SELECT 'pacientes com foto', COUNT(*) FROM tbl_paciente WHERE foto_avatar IS NOT NULL
UNION ALL SELECT 'profissionais com foto', COUNT(*) FROM tbl_profissional WHERE foto_avatar IS NOT NULL
UNION ALL SELECT 'vinculos', COUNT(*) FROM tbl_vinculo
UNION ALL SELECT 'consultas', COUNT(*) FROM tbl_consulta
UNION ALL SELECT 'tarefas', COUNT(*) FROM tbl_tarefa
UNION ALL SELECT 'registros de humor', COUNT(*) FROM tbl_registro_humor
UNION ALL SELECT 'tratamentos', COUNT(*) FROM tbl_tratamento
UNION ALL SELECT 'notificacoes', COUNT(*) FROM tbl_notificacao;

-- usuarios sem o perfil correspondente (deve retornar 0 linhas)
SELECT u.id, u.email, u.nivel FROM tbl_usuario u
LEFT JOIN tbl_administrador a ON a.id_usuario = u.id AND u.nivel = 0
LEFT JOIN tbl_profissional pr ON pr.id_usuario = u.id AND u.nivel = 1
LEFT JOIN tbl_paciente pa ON pa.id_usuario = u.id AND u.nivel = 2
WHERE a.id IS NULL AND pr.id IS NULL AND pa.id IS NULL;
