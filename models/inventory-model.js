const pool = require("../database") // seu arquivo de conexão

const invModel = {}

/* ***************************
 * Add new classification
 * ************************** */
invModel.addClassification = async function (classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const values = [classification_name]
    const result = await pool.query(sql, values)
    return result.rows[0] // retorna a classificação inserida
  } catch (error) {
    console.error("Error in addClassification:", error)
    return null
  }
}

/* ***************************
 * Add new inventory item
 * ************************** */
invModel.addInventory = async function (vehicle) {
  try {
    const sql = `INSERT INTO inventory 
      (inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_image, inv_thumbnail, classification_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`
    const values = [
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_year,
      vehicle.inv_description,
      vehicle.inv_price,
      vehicle.inv_miles,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.classification_id,
    ]
    const result = await pool.query(sql, values)
    return result.rows[0]
  } catch (error) {
    console.error("Error in addInventory:", error)
    return null
  }
}

/* ***************************
 * Get all classifications
 * ************************** */
invModel.getClassifications = async function () {
  try {
    const sql = "SELECT * FROM classification ORDER BY classification_name ASC"
    const result = await pool.query(sql)
    return result
  } catch (error) {
    console.error("Error in getClassifications:", error)
    return null
  }
}

/* ***************************
 * Get inventory by classification id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE classification_id = $1"
    const result = await pool.query(sql, [classification_id])
    return result.rows
  } catch (error) {
    console.error("Error in getInventoryByClassificationId:", error)
    return []
  }
}

/* ***************************
 * Get inventory by id
 * ************************** */
invModel.getInventoryById = async function (inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("Error in getInventoryById:", error)
    return null
  }
}

module.exports = invModel
