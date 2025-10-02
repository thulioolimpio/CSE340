const { Pool } = require("pg")

console.log("=== Database Connection ===")
console.log("NODE_ENV:", process.env.NODE_ENV)

const isProduction = process.env.NODE_ENV === "production"

const pool = new Pool({
  user: "assignment2_1708_user",
  host: "dpg-d38ngq3uibrs739vohlg-a.oregon-postgres.render.com",
  database: "assignment2_1708",
  password: "wqWkZBcmMLGPo9pZ625r2K1r8WNg2siO",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
})


pool.on("connect", () => {
  console.log("✅ Conectado ao PostgreSQL")
})

pool.on("error", (err) => {
  console.error("❌ Erro na pool:", err)
})

pool.query("SELECT NOW()")
  .then(() => console.log("✅ Teste de conexão bem-sucedido"))
  .catch(err => console.error("❌ Teste de conexão falhou:", err.message))

module.exports = {
  pool,
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      return res
    } catch (error) {
      console.error("❌ Erro na query:", error.message)
      throw error
    }
  },
}
