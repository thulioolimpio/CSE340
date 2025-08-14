const { Pool } = require('pg');
require('dotenv').config();

// Configuração detalhada da conexão
const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'cse340_motors',
  password: process.env.DB_PASSWORD || '1914', // Nunca deixe senha padrão em produção
  port: parseInt(process.env.DB_PORT) || 5432,
  
  // Configurações de SSL
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  
  // Configurações do pool
  max: 20, // Número máximo de clientes no pool
  idleTimeoutMillis: 30000, // Tempo máximo de inatividade (30s)
  connectionTimeoutMillis: 5000, // Tempo máximo para estabelecer conexão (5s)
  
  // Configurações específicas para resolver SASL
  application_name: 'cse340_motors_app',
  options: '-c search_path=public'
};

// Criação do pool com tratamento de erros
let pool;
try {
  pool = new Pool(config);
  
  // Eventos do pool para monitoramento
  pool.on('connect', () => {
    console.log('Nova conexão estabelecida com o PostgreSQL');
  });
  
  pool.on('error', (err) => {
    console.error('Erro inesperado no pool do PostgreSQL:', err);
    // Em produção, você pode querer reiniciar a aplicação aqui
  });
} catch (err) {
  console.error('Falha ao criar pool de conexões:', err);
  process.exit(1); // Encerra a aplicação se não conseguir conectar
}

// Função de teste de conexão melhorada
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time, current_user');
    return { 
      success: true, 
      time: res.rows[0].current_time,
      user: res.rows[0].current_user
    };
  } catch (err) {
    return { 
      success: false, 
      error: err.message,
      stack: err.stack
    };
  } finally {
    if (client) client.release();
  }
};

// Teste de conexão imediato com log detalhado
(async () => {
  const conn = await testConnection();
  if (conn.success) {
    console.log(`✅ Database connected at ${conn.time} as ${conn.user}`);
  } else {
    console.error('❌ Database connection failed:', {
      error: conn.error,
      stack: conn.stack
    });
    process.exit(1); // Encerra se não conseguir conectar
  }
})();

// Exporta o pool e funções úteis
module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params),
  end: () => pool.end().then(() => console.log('Pool de conexões encerrado'))
};