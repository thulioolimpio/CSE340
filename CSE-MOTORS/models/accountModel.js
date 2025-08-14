const pool = require('../database/connection');

const accountModel = {
  // Obter conta por ID
  getAccountById: async function (account_id) {
    try {
      const result = await pool.query(
        "SELECT account_id, account_firstname, account_lastname, account_email, account_type " +
        "FROM account WHERE account_id = $1", 
        [account_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in getAccountById:', error);
      throw error;
    }
  },

  // Obter conta por email (para verificação de duplicatas)
  getAccountByEmail: async function (email) {
    try {
      const result = await pool.query(
        "SELECT account_id, account_email FROM account WHERE account_email = $1",
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error in getAccountByEmail:', error);
      throw error;
    }
  },

  // Atualizar informações da conta
  updateAccount: async function (account_id, firstname, lastname, email) {
    try {
      const result = await pool.query(
        "UPDATE account SET " +
        "account_firstname = $1, " +
        "account_lastname = $2, " +
        "account_email = $3, " +
        "account_updated = NOW() " +
        "WHERE account_id = $4 RETURNING *",
        [firstname, lastname, email, account_id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('No account found with this ID');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateAccount:', error);
      throw error;
    }
  },

  // Atualizar senha
  updatePassword: async function (account_id, password) {
    try {
      const result = await pool.query(
        "UPDATE account SET " +
        "account_password = $1, " +
        "account_updated = NOW() " +
        "WHERE account_id = $2 RETURNING account_id",
        [password, account_id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('No account found with this ID');
      }
      
      return true;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  }
};

module.exports = accountModel;