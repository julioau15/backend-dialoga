-- ------------------------------------------------------------
-- Ajustes para a confirmação de doses e o lembrete automático.
-- Executar uma única vez em bancos já criados com o script-creates.sql antigo.
-- ------------------------------------------------------------

-- remove registros duplicados (mesmo horário e mesma data prevista), mantendo o de menor id
DELETE r1 FROM tbl_registro_dose AS r1
INNER JOIN tbl_registro_dose AS r2
        ON r1.id_horario_tratamento = r2.id_horario_tratamento
       AND r1.data_hora_prevista = r2.data_hora_prevista
       AND r1.id > r2.id;

-- uma única dose por horário em cada data/hora prevista
ALTER TABLE tbl_registro_dose
ADD CONSTRAINT UQ_REGISTRODOSE_HORARIO_DATA UNIQUE (id_horario_tratamento, data_hora_prevista);

-- índice usado para não enviar o mesmo lembrete duas vezes
CREATE INDEX IDX_NOTIFICACAO_REFERENCIA ON tbl_notificacao (referencia_evento);
