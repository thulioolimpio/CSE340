const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for both local AND production environments
 * Render PostgreSQL requires SSL
 * *************** */
let pool

if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
} else {
  // PRODUÇÃO (Render) - também precisa de SSL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // ESSENCIAL para Render
    },
  })
}

// Mova a exportação para fora do if-else
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      if (process.env.NODE_ENV == "development") {
        console.log("executed query", { text })
      }
      return res
    } catch (error) {
      console.error("error in query", { text })
      throw error
    }
  },
}