require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necessário para conexão segura no Render
});

// Teste de conexão
pool.query('SELECT NOW()')
  .then(res => console.log('✅ Conexão OK:', res.rows[0].now))
  .catch(err => {
    console.error('❌ Falha na conexão:', err);
    process.exit(1);
  });

module.exports = pool;
