// CSE-MOTORS/database/connection.js
const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cse340_motors',
  password: process.env.DB_PASSWORD || '1914',
  port: process.env.DB_PORT || 5432,
});

// Teste de conexão
pool.query('SELECT NOW()', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Database connected successfully');
});

module.exports = pool;