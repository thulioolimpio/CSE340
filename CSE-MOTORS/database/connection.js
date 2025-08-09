const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '1914'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'cse340_motors'}`,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

// Função de teste de conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    return { success: true, time: res.rows[0].now };
  } catch (err) {
    return { success: false, error: err };
  }
};

// Testar a conexão imediatamente
(async () => {
  const conn = await testConnection();
  console.log(conn.success ? 
    `Database connected at ${conn.time}` : 
    'Database connection failed:', conn.error);
})();

module.exports = { pool, testConnection };