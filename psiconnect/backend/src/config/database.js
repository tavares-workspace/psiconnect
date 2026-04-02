// Aqui fazemos a conexão com o banco de dados PostgreSQL
// Usamos o pacote 'pg' que é a biblioteca oficial do PostgreSQL para Node.js

const { Pool } = require('pg');

// IMPORTANTE: O banco está hospedado no Railway.
// O Railway SEMPRE exige SSL na conexão, mesmo quando você está rodando
// o backend localmente. Por isso, ssl fica sempre ativo aqui.
// rejectUnauthorized: false aceita o certificado do Railway sem erro.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Testa se a conexão funcionou ao iniciar o servidor
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message);
    return;
  }
  release(); // libera a conexão de volta para o pool
  console.log('✅ Banco de dados Railway conectado!');
});

// Exporta o pool para ser usado nos models
module.exports = pool;
