-- ============================================================
-- PsiConnect — Schema da tabela de usuários
-- Execute este script no Railway antes de rodar o sistema
-- ============================================================

-- Extensão para gerar UUIDs automaticamente
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de psicólogos (usuários do sistema)
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  crp           VARCHAR(20),
  phone         VARCHAR(20),
  created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION atualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que chama a função acima ao atualizar um registro
DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION atualizar_updated_at();

-- Índice para acelerar a busca por e-mail (usada no login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

SELECT 'Tabela users criada com sucesso!' AS resultado;
