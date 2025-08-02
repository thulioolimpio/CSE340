const pool = require('../database');

async function getInventoryItemById(inv_id) {
  try {
    const sql = `
      SELECT i.*, c.classification_name 
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `;
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

module.exports = { getInventoryItemById };