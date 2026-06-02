-- Corrige a coluna de criptografia para TEXT
-- (o novo sistema usa crypto do Node.js, não pgcrypto)
ALTER TABLE prontuarios ALTER COLUMN evolucao_encrypted TYPE TEXT USING evolucao_encrypted::text;

-- Limpa registros antigos com dados em formato bytea que não podem ser migrados
-- (se houver dados antigos incompatíveis, apaga para recomeçar limpo)
UPDATE prontuarios SET evolucao_encrypted = '' WHERE evolucao_encrypted IS NOT NULL AND evolucao_encrypted NOT LIKE '%:%';

SELECT 'Coluna corrigida com sucesso!' AS resultado;
