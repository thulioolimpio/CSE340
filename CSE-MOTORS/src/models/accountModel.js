const db = require('../db')

// Ajude o TypeScript mental: estrutura esperada na tabela 'account':
// account_id (PK), account_firstname, account_lastname, account_email (UNIQUE),
// account_password (HASH), account_type ('Client' | 'Employee' | 'Admin')

async function getAccountById(account_id) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_type
    FROM account
    WHERE account_id = $1
    LIMIT 1
  `
  const { rows } = await db.query(sql, [account_id])
  return rows[0] || null
}

async function getAccountByEmail(account_email) {
  const sql = `
    SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type
    FROM account
    WHERE account_email = $1
    LIMIT 1
  `
  const { rows } = await db.query(sql, [account_email])
  return rows[0] || null
}

async function emailExistsButAnother(account_email, account_id) {
  const sql = `
    SELECT 1 FROM account WHERE account_email = $1 AND account_id <> $2 LIMIT 1
  `
  const { rows } = await db.query(sql, [account_email, account_id])
  return !!rows[0]
}

async function updateAccountInfo({ account_id, account_firstname, account_lastname, account_email }) {
  const sql = `
    UPDATE account
       SET account_firstname = $1,
           account_lastname  = $2,
           account_email     = $3
     WHERE account_id = $4
   RETURNING account_id
  `
  const { rows } = await db.query(sql, [
    account_firstname,
    account_lastname,
    account_email,
    account_id,
  ])
  return rows[0]?.account_id ? { success: true } : { success: false }
}

async function updatePassword({ account_id, password_hash }) {
  const sql = `
    UPDATE account
       SET account_password = $1
     WHERE account_id = $2
   RETURNING account_id
  `
  const { rows } = await db.query(sql, [password_hash, account_id])
  return rows[0]?.account_id ? { success: true } : { success: false }
}

module.exports = {
  getAccountById,
  getAccountByEmail,
  emailExistsButAnother,
  updateAccountInfo,
  updatePassword,
}
