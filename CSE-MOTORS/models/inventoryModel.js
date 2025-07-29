// models/inventoryModel.js
const pool = require("../database");

async function getVehicleById(inv_id) {
  const query = "SELECT * FROM inventory WHERE inv_id = $1";
  const result = await pool.query(query, [inv_id]);
  return result.rows[0];
}

module.exports = { getVehicleById };
