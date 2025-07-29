// Get inventory item details by ID
async function getInventoryItemById(inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getInventoryItemById error: " + error);
    return null;
  }
}

// Don't forget to export the new function
module.exports = { getClassifications, getInventoryByClassificationId, getInventoryItemById };