-- ============================================================
-- PsiConnect — Script de ATUALIZAÇÃO do banco
-- Execute no Query Editor do Railway
-- Pode rodar mesmo que algumas coisas já existam
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Coluna de etapa do funil nos pacientes
ALTER TABLE patients ADD COLUMN IF NOT EXISTS funil_etapa VARCHAR(50) NOT NULL DEFAULT 'Interessado';

-- Remove constraint antiga se existir e recria
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_funil_etapa_check;
ALTER TABLE patients ADD CONSTRAINT patients_funil_etapa_check
  CHECK (funil_etapa IN (
    'Interessado','Triagem','Agendamento','Primeira Sessão',
    'Paciente Ativo','Aguardando Retorno','Alta/Encerrado','Abandono'
  ));

-- 2. Tabela de prontuários com criptografia
CREATE TABLE IF NOT EXISTS prontuarios (
  id                 UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         UUID      NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  evolucao_encrypted TEXT,
  contrato_path      VARCHAR(500),
  contrato_nome      VARCHAR(255),
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prontuarios_patient ON prontuarios(patient_id);

DROP TRIGGER IF EXISTS trg_prontuarios ON prontuarios;
CREATE TRIGGER trg_prontuarios
  BEFORE UPDATE ON prontuarios
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- 3. Tabela de tarefas automáticas
CREATE TABLE IF NOT EXISTS tarefas (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID         REFERENCES patients(id) ON DELETE CASCADE,
  titulo     VARCHAR(200) NOT NULL,
  tipo       VARCHAR(50)  NOT NULL,
  done       BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_user    ON tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_patient ON tarefas(patient_id);

-- 4. Duração fixa de 60 minutos para todas as consultas
ALTER TABLE appointments ALTER COLUMN duration_minutes SET DEFAULT 60;
UPDATE appointments SET duration_minutes = 60;

-- Verificação final — lista todas as tabelas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
