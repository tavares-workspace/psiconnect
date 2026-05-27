-- Remove constraint de UNIQUE global no CPF se existir
-- O CPF deve ser único apenas dentro do mesmo usuário, não globalmente
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'patients'::regclass
    AND contype = 'u'
    AND array_to_string(
      ARRAY(SELECT attname FROM pg_attribute WHERE attrelid = conrelid AND attnum = ANY(conkey)),
      ','
    ) = 'cpf';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE patients DROP CONSTRAINT ' || constraint_name;
    RAISE NOTICE 'Constraint % removida.', constraint_name;
  ELSE
    RAISE NOTICE 'Nenhuma constraint UNIQUE global de CPF encontrada.';
  END IF;
END $$;

-- Remove índice UNIQUE global no CPF se existir
DROP INDEX IF EXISTS patients_cpf_key;
DROP INDEX IF EXISTS idx_patients_cpf;

-- Cria índice correto: CPF único POR usuário (não globalmente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_user_cpf
  ON patients(user_id, cpf)
  WHERE cpf IS NOT NULL AND cpf != '';

SELECT 'CPF corrigido: agora é único por usuário, não globalmente.' AS resultado;
