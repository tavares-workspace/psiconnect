-- Adiciona colunas de recorrência na tabela appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recorrencia_id   UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS recorrencia_tipo VARCHAR(20);

-- Index para buscar todos de uma série rapidamente
CREATE INDEX IF NOT EXISTS idx_appointments_recorrencia ON appointments(recorrencia_id);

-- uuid-ossp para gerar UUIDs no Node (caso não esteja instalado)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

SELECT 'Colunas de recorrência adicionadas!' AS resultado;
