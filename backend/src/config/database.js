const { Pool, types } = require('pg');

// Retorna TIMESTAMP como string pura, sem converter para UTC
types.setTypeParser(1114, (val) => val);  // TIMESTAMP WITHOUT TIME ZONE
types.setTypeParser(1184, (val) => val);  // TIMESTAMP WITH TIME ZONE

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message);
    return;
  }
  release();
  console.log('Banco de dados Railway conectado!');
});

module.exports = pool;
