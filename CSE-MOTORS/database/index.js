const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'cse340_motors',
  password: '1914',
  port: 5432
});

// Teste de conexão
pool.query('SELECT NOW()')
  .then(res => console.log('✅ Conexão OK:', res.rows[0].now))
  .catch(err => {
    console.error('❌ Falha na conexão:', err);
    process.exit(1);
  });

module.exports = pool;