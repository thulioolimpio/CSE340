const { Pool } = require('pg');
require('dotenv').config();

// Configuração robusta para ambientes locais e Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '1914'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'cse340_motors'}`,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false
});

// Teste de conexão aprimorado
async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('Database connected successfully at:', res.rows[0].now);
    client.release();
    
    // Verificação adicional da tabela classification
    const classRes = await client.query('SELECT COUNT(*) FROM classification');
    console.log(`Tabela classification existe com ${classRes.rows[0].count} registros`);
    
    return true;
  } catch (err) {
    console.error('FALHA NA CONEXÃO COM O BANCO:', {
      error: err,
      config: {
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        usingSSL: process.env.NODE_ENV === 'production'
      },
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Testar imediatamente e a cada 5 minutos
testConnection();
setInterval(testConnection, 300000);

module.exports = {
  pool,
  testConnection
};