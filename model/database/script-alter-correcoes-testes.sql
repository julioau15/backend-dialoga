-- ------------------------------------------------------------
-- Correções da rodada de testes (Admin / Profissional / Paciente).
-- Executar uma única vez em bancos já criados com o script-creates.sql antigo
-- (com o banco selecionado: mysql ... db_dialoga < script-alter-correcoes-testes.sql).
-- As mesmas alterações já estão no script-creates.sql para bancos novos.
-- ------------------------------------------------------------

-- [Task 2] quem criou cada administrador (NULL nos admins antigos: sem bloqueio)
ALTER TABLE tbl_administrador
ADD COLUMN id_administrador_criador INT NULL,
ADD CONSTRAINT FK_ADMINISTRADOR_CRIADOR
    FOREIGN KEY (id_administrador_criador)
    REFERENCES tbl_administrador (id)
    ON DELETE SET NULL;

-- [Task 3] divisão fixa das solicitações entre os administradores:
-- cada solicitação pendente fica atribuída a um admin responsável, e só ele decide
-- (se o responsável for removido, a solicitação volta a ficar sem responsável e é redistribuída)
ALTER TABLE tbl_administrador_profissional
ADD COLUMN id_admin_responsavel INT NULL,
ADD CONSTRAINT FK_ADMINISTRADOR_RESPONSAVEL_APROVACAO
    FOREIGN KEY (id_admin_responsavel)
    REFERENCES tbl_administrador (id)
    ON DELETE SET NULL;

-- [Task 8] vínculos aceitos/recusados pela API eram gravados como '1'/'2'; o seed usa texto
UPDATE tbl_vinculo SET status = 'ativo' WHERE status = '1';
UPDATE tbl_vinculo SET status = 'recusado' WHERE status = '2';

-- [Task 8] paciente com vínculo ativo não pode continuar 'pendente'
UPDATE tbl_paciente AS p
SET p.status_atividade = 'ativo'
WHERE p.status_atividade = 'pendente'
  AND EXISTS (SELECT 1 FROM tbl_vinculo AS v WHERE v.id_paciente = p.id AND v.status = 'ativo');

-- [Task 11] categorias de agenda usadas na nova consulta e nos lembretes automáticos
-- (o back busca o id pelo nome; o INSERT só acontece se a categoria ainda não existir)
INSERT INTO tbl_categoria (categoria, tipo_especifico)
SELECT 'agenda', 'nova_consulta' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tbl_categoria WHERE categoria = 'agenda' AND tipo_especifico = 'nova_consulta');

INSERT INTO tbl_categoria (categoria, tipo_especifico)
SELECT 'agenda', 'lembrete_atendimento' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tbl_categoria WHERE categoria = 'agenda' AND tipo_especifico = 'lembrete_atendimento');

INSERT INTO tbl_categoria (categoria, tipo_especifico)
SELECT 'agenda', 'lembrete_vespera' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tbl_categoria WHERE categoria = 'agenda' AND tipo_especifico = 'lembrete_vespera');

-- [Tasks 12, 15 e 17] categorias compartilhadas com os nomes que a API aceita
-- (bancos antigos usavam 'humor' / 'sono' / 'medicacao'); 'Tratamentos' = consentimento
-- para o profissional ver os tratamentos do paciente
UPDATE tbl_categoria_compartilhada SET categoria = 'Humor'         WHERE categoria = 'humor';
UPDATE tbl_categoria_compartilhada SET categoria = 'Horas de sono' WHERE categoria = 'sono';
UPDATE tbl_categoria_compartilhada SET categoria = 'Tratamentos'   WHERE categoria = 'medicacao';

-- [Ajustes] frequência dos tratamentos com as opções da tela (registros antigos: "1x ao dia", "à noite")
UPDATE tbl_tratamento SET frequencia = 'Uma vez ao dia'    WHERE frequencia IN ('1x ao dia', 'à noite');
UPDATE tbl_tratamento SET frequencia = 'Duas vezes ao dia' WHERE frequencia = '2x ao dia';
UPDATE tbl_tratamento SET frequencia = 'Três vezes ao dia' WHERE frequencia = '3x ao dia';
UPDATE tbl_tratamento SET frequencia = 'Quatro vezes ao dia' WHERE frequencia = '4x ao dia';

-- [Ajustes] RN10: um registro de humor por paciente por dia.
-- Se este comando falhar por duplicidade, liste os dias repetidos com:
--   SELECT id_paciente, data, COUNT(*) FROM tbl_registro_humor GROUP BY id_paciente, data HAVING COUNT(*) > 1;
-- e decida qual registro manter antes de rodar de novo.
ALTER TABLE tbl_registro_humor
ADD CONSTRAINT UQ_REGISTROHUMOR_PACIENTE_DATA UNIQUE (id_paciente, data);
