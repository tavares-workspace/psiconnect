-- ============================================================
-- PsiConnect — Script SQL seguro para rodar no Railway
-- Pode rodar mesmo que as tabelas já existam.
-- Usa IF NOT EXISTS e DROP IF EXISTS para evitar erros.
-- ============================================================

-- Habilita a extensão de UUID (não dá erro se já estiver ativa)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Remove triggers antigos se existirem (evita erro de duplicata)
-- ============================================================
DROP TRIGGER IF EXISTS trg_users      ON users;
DROP TRIGGER IF EXISTS trg_patients   ON patients;
DROP TRIGGER IF EXISTS trg_appts      ON appointments;
DROP TRIGGER IF EXISTS trg_notes      ON appointment_notes;
DROP TRIGGER IF EXISTS trg_cal_tokens ON google_calendar_tokens;

-- Remove triggers com nome antigo (versão anterior do projeto)
DROP TRIGGER IF EXISTS trg_users_updated_at      ON users;
DROP TRIGGER IF EXISTS trg_patients_updated_at   ON patients;
DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS trg_notes_updated_at      ON appointment_notes;
DROP TRIGGER IF EXISTS trg_tokens_updated_at     ON google_calendar_tokens;

-- ============================================================
-- Remove indexes antigos se existirem
-- ============================================================
DROP INDEX IF EXISTS idx_patients_user;
DROP INDEX IF EXISTS idx_patients_nome;
DROP INDEX IF EXISTS idx_patients_user_id;
DROP INDEX IF EXISTS idx_patients_name;
DROP INDEX IF EXISTS idx_appointments_user;
DROP INDEX IF EXISTS idx_appointments_patient;
DROP INDEX IF EXISTS idx_appointments_data;
DROP INDEX IF EXISTS idx_appointments_user_id;
DROP INDEX IF EXISTS idx_appointments_patient_id;
DROP INDEX IF EXISTS idx_appointments_scheduled_at;
DROP INDEX IF EXISTS idx_notes_appointment;
DROP INDEX IF EXISTS idx_notes_appointment_id;
DROP INDEX IF EXISTS idx_reminders_user;
DROP INDEX IF EXISTS idx_reminders_data;
DROP INDEX IF EXISTS idx_reminders_user_id;
DROP INDEX IF EXISTS idx_reminders_remind_at;

-- ============================================================
-- Tabela: users
-- Armazena os dados do psicólogo (dono da conta)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  crp           VARCHAR(20),
  phone         VARCHAR(20),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Garante que a coluna crp existe (caso a tabela já existia sem ela)
ALTER TABLE users ADD COLUMN IF NOT EXISTS crp   VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- ============================================================
-- Tabela: patients
-- Pacientes cadastrados pelo psicólogo
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(150),
  phone      VARCHAR(20),
  birth_date DATE,
  cpf        VARCHAR(14),
  address    VARCHAR(255),
  notes      TEXT,
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Garante colunas que podem estar faltando em versões antigas
ALTER TABLE patients ADD COLUMN IF NOT EXISTS active     BOOLEAN   NOT NULL DEFAULT TRUE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS notes      TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address    VARCHAR(255);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS cpf        VARCHAR(14);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_nome ON patients(user_id, name);

-- ============================================================
-- Tabela: appointments
-- Consultas agendadas
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id       UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  scheduled_at     TIMESTAMP   NOT NULL,
  duration_minutes INT         NOT NULL DEFAULT 50,
  status           VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  price            DECIMAL(10,2),
  google_event_id  VARCHAR(255),
  created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Garante colunas que podem estar faltando
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS price           DECIMAL(10,2);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMP NOT NULL DEFAULT NOW();

-- Garante que o check constraint de status existe corretamente
-- (remove e recria para evitar conflito com versão antiga)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check
  CHECK (status IN ('scheduled', 'completed', 'cancelled'));

CREATE INDEX IF NOT EXISTS idx_appointments_user    ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_data    ON appointments(user_id, scheduled_at);

-- ============================================================
-- Tabela: appointment_notes
-- Anotações clínicas vinculadas a uma consulta
-- ============================================================
CREATE TABLE IF NOT EXISTS appointment_notes (
  id             UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID      NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  content        TEXT      NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE appointment_notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_notes_appointment ON appointment_notes(appointment_id);

-- ============================================================
-- Tabela: reminders
-- Lembretes internos do psicólogo
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  description TEXT,
  remind_at   TIMESTAMP    NOT NULL,
  done        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

ALTER TABLE reminders ADD COLUMN IF NOT EXISTS done        BOOLEAN   NOT NULL DEFAULT FALSE;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_data ON reminders(user_id, remind_at);

-- ============================================================
-- Tabela: google_calendar_tokens
-- Tokens OAuth 2.0 do Google por usuário
-- ============================================================
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  access_token  TEXT      NOT NULL,
  refresh_token TEXT      NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE google_calendar_tokens ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- ============================================================
-- Função para atualizar updated_at automaticamente
-- OR REPLACE: substitui se já existir
-- ============================================================
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recria os triggers (já foram removidos no início do script)
CREATE TRIGGER trg_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_patients
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_appts
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_notes
  BEFORE UPDATE ON appointment_notes
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

CREATE TRIGGER trg_cal_tokens
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- ============================================================
-- Verificação final: lista as tabelas criadas
-- ============================================================
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns 
        WHERE table_name = t.table_name AND table_schema = 'public') AS colunas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
