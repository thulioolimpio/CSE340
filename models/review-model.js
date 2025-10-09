const pool = require("../database/")

/* ****************************************
 * Insert new review
 * ****************************************/
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = "INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *"
    return await pool.query(sql, [review_text, inv_id, account_id])
  } catch (error) {
    console.error("addReview model error: " + error)
    return error.message
  }
}

/* ****************************************
 * Get reviews by Inventory ID
 * ****************************************/
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        r.review_id, r.review_text, r.review_date, r.inv_id,
        a.account_firstname, a.account_lastname
      FROM review AS r
      JOIN account AS a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByInventoryId model error: " + error)
    return null
  }
}

/* ****************************************
 * Get reviews by Account ID (for Account Management)
 * ****************************************/
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT 
        r.review_id, r.review_text, r.review_date, r.inv_id,
        i.inv_make, i.inv_model
      FROM review AS r
      JOIN inventory AS i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByAccountId model error: " + error)
    return null
  }
}

/* ****************************************
 * Get single review by Review ID
 * ****************************************/
async function getReviewByReviewId(review_id) {
  try {
    const sql = `
      SELECT 
        r.review_id, r.review_text, r.review_date, r.inv_id,
        i.inv_make, i.inv_model
      FROM review AS r
      JOIN inventory AS i ON r.inv_id = i.inv_id
      WHERE r.review_id = $1
    `
    const data = await pool.query(sql, [review_id])
    return data.rows[0]
  } catch (error) {
    console.error("getReviewByReviewId model error: " + error)
    return null
  }
}

/* ****************************************
 * Update review text
 * ****************************************/
async function updateReview(review_id, review_text) {
  try {
    const sql = "UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *"
    const data = await pool.query(sql, [review_text, review_id])
    return data.rows[0]
  } catch (error) {
    console.error("updateReview model error: " + error)
    return null
  }
}

/* ****************************************
 * Delete review
 * ****************************************/
async function deleteReview(review_id) {
  try {
    const sql = 'DELETE FROM review WHERE review_id = $1'
    const data = await pool.query(sql, [review_id])
    return data
  } catch (error) {
    console.error("deleteReview model error: " + error)
    return null
  }
}

module.exports = {
  addReview,
  getReviewsByInventoryId,
  getReviewsByAccountId,
  getReviewByReviewId,
  updateReview,
  deleteReview
}