// Conexão com o banco de dados PostgreSQL

const { Pool } = require('pg');

// O banco está hospedado no Railway.

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
