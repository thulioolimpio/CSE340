const { Pool } = require("pg")

let pool

console.log("=== Database Connection ===")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Existe" : "Não existe")

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL')
  })

  pool.on('error', (err) => {
    console.error('❌ Erro na pool:', err)
  })

} catch (error) {
  console.error('❌ Erro ao criar pool:', error)
}

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