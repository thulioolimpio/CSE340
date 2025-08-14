const { Pool } = require('pg');
require('dotenv').config();

// Configuração avançada do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  
  // Configurações adicionais para melhor desempenho e estabilidade
  max: 20, // número máximo de clientes no pool
  idleTimeoutMillis: 30000, // tempo em ms que um cliente pode ficar inativo
  connectionTimeoutMillis: 2000, // tempo para tentar conectar
});

// Middleware para verificar a conexão
pool.on('connect', (client) => {
  console.log('Nova conexão estabelecida com o PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool do PostgreSQL:', err);
  process.exit(-1); // Encerra o aplicativo em caso de erro grave
});

// Função de teste de conexão
async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    console.log('Conexão com PostgreSQL bem-sucedida:', res.rows[0].current_time);
    return true;
  } catch (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err);
    return false;
  }
}

// Versão melhorada da função query com tratamento de erros
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Erro na query:', {
      text,
      params,
      error: err.message,
      stack: err.stack
    });
    throw err; // Re-lança o erro para ser tratado pelo chamador
  }
}

// Exporta as funções
module.exports = {
  query,
  testConnection,
  getPool: () => pool, // Para acesso direto ao pool quando necessário
  end: async () => {
    try {
      await pool.end();
      console.log('Pool do PostgreSQL encerrado com sucesso');
    } catch (err) {
      console.error('Erro ao encerrar pool do PostgreSQL:', err);
    }
  }
};