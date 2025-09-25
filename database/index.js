const { Pool } = require("pg")

console.log("=== Database Connection ===")
console.log("NODE_ENV:", process.env.NODE_ENV)

// Configuração CORRETA para Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // ← ISSO É OBRIGATÓRIO PARA RENDER
  }
})

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Erro na pool:', err)
})

// Teste inicial
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Teste de conexão bem-sucedido'))
  .catch(err => console.error('❌ Teste de conexão falhou:', err.message))

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("✅ Query executada com sucesso")
      return res
    } catch (error) {
      console.error("❌ Erro na query:", error.message)
      throw error
    }
  },
}