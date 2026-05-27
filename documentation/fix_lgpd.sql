-- Adiciona coluna de aceite dos termos de uso (LGPD)
ALTER TABLE users ADD COLUMN IF NOT EXISTS aceite_termos BOOLEAN NOT NULL DEFAULT false;

-- Usuários já cadastrados são considerados como tendo aceito (retroativo)
UPDATE users SET aceite_termos = true WHERE aceite_termos = false;

SELECT 'Coluna aceite_termos adicionada!' AS resultado;
