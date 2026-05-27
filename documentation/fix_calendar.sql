-- Garante que a tabela google_calendar_tokens tem updated_at
-- Execute no Railway se necessário
ALTER TABLE google_calendar_tokens
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Garante que há apenas um token por usuário (UNIQUE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'google_calendar_tokens_user_id_key'
  ) THEN
    ALTER TABLE google_calendar_tokens ADD CONSTRAINT google_calendar_tokens_user_id_key UNIQUE (user_id);
  END IF;
END $$;

SELECT 'Tabela google_calendar_tokens OK!' AS resultado;
