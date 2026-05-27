
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message);
    return;
  }
  release(); // libera a conexão de volta para o pool
  console.log('Banco de dados Railway conectado!');
});

module.exports = pool;
