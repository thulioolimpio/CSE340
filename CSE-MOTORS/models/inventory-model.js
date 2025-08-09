const pool = require('../database/connection');
const fs = require('fs').promises;
const path = require('path');

/**
 * Obtém todas as classificações ordenadas por nome
 */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM classification ORDER BY classification_name"
    );
    return result.rows || [];
  } catch (error) {
    console.error("Error getting classifications:", error);
    return [];
  }
}

/**
 * Verifica se uma classificação existe pelo nome
 */
async function getClassificationByName(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const result = await pool.query(sql, [classification_name.trim()]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error checking classification:", error);
    throw new Error('Database error while checking classification');
  }
}

/**
 * Adiciona uma nova classificação com verificação
 */
async function addClassification(classification_name) {
  try {
    if (!classification_name || classification_name.length < 3) {
      throw new Error('Classification name must be at least 3 characters');
    }

    const exists = await getClassificationByName(classification_name);
    if (exists) {
      throw new Error('Classification already exists');
    }

    const sql = `
      INSERT INTO classification (classification_name) 
      VALUES ($1) 
      RETURNING classification_id, classification_name
    `;
    const result = await pool.query(sql, [classification_name.trim()]);
    
    // Verificação pós-inserção
    const verify = await pool.query(
      "SELECT * FROM classification WHERE classification_id = $1", 
      [result.rows[0].classification_id]
    );
    
    if (!verify.rows[0]) {
      throw new Error('Insert verification failed');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error adding classification:', {
      error: error.message,
      attemptedName: classification_name,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Obtém um veículo pelo ID com verificação
 */
async function getInventoryItemById(inv_id) {
  try {
    const sql = `
      SELECT i.*, c.classification_name 
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `;
    const result = await pool.query(sql, [inv_id]);
    
    if (!result.rows[0]) {
      throw new Error('Vehicle not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error("Error getting inventory item:", {
      id: inv_id,
      error: error.message
    });
    throw error;
  }
}

/**
 * Adiciona um novo veículo com verificação em múltiplos níveis
 */
async function addInventory(inventoryData) {
  const requiredFields = [
    'classification_id', 'inv_make', 'inv_model', 
    'inv_year', 'inv_price', 'inv_miles', 'inv_color'
  ];
  
  const missingFields = requiredFields.filter(field => !inventoryData[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  try {
    // Verifica se a classificação existe
    const classificationExists = await pool.query(
      "SELECT classification_id FROM classification WHERE classification_id = $1",
      [inventoryData.classification_id]
    );
    
    if (!classificationExists.rows[0]) {
      throw new Error('Classification does not exist');
    }

    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model, inv_year,
        inv_price, inv_miles, inv_color, inv_description,
        inv_image, inv_thumbnail
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING inv_id
    `;
    
    const values = [
      parseInt(inventoryData.classification_id),
      inventoryData.inv_make.trim(),
      inventoryData.inv_model.trim(),
      parseInt(inventoryData.inv_year),
      parseFloat(inventoryData.inv_price),
      parseInt(inventoryData.inv_miles),
      inventoryData.inv_color.trim(),
      inventoryData.inv_description?.trim() || null,
      inventoryData.inv_image || '/images/vehicles/no-image.jpg',
      inventoryData.inv_thumbnail || '/images/vehicles/no-image-tn.jpg'
    ];

    console.log('Executing query:', sql, 'with values:', values);
    
    const result = await pool.query(sql, values);
    
    if (!result.rows[0]?.inv_id) {
      throw new Error('No ID returned from insert');
    }

    // Verificação rigorosa pós-inserção
    const insertedVehicle = await getInventoryItemById(result.rows[0].inv_id);
    
    if (!insertedVehicle) {
      throw new Error('Insert verification failed - vehicle not found');
    }

    console.log('Successfully added vehicle:', insertedVehicle);
    return insertedVehicle.inv_id;
    
  } catch (error) {
    console.error('Database error in addInventory:', {
      error: error.message,
      code: error.code,
      attemptedData: inventoryData,
      timestamp: new Date().toISOString()
    });

    // Limpeza de arquivos em caso de erro
    try {
      if (inventoryData.inv_image && inventoryData.inv_image !== '/images/vehicles/no-image.jpg') {
        await fs.unlink(path.join(__dirname, '../public', inventoryData.inv_image));
      }
      if (inventoryData.inv_thumbnail && inventoryData.inv_thumbnail !== '/images/vehicles/no-image-tn.jpg') {
        await fs.unlink(path.join(__dirname, '../public', inventoryData.inv_thumbnail));
      }
    } catch (cleanupError) {
      console.error('Error cleaning up files:', cleanupError);
    }

    throw error;
  }
}

/**
 * Obtém os últimos veículos adicionados
 */
async function getRecentAdditions(limit = 5) {
  try {
    const result = await pool.query(
      `SELECT * FROM inventory 
       ORDER BY inv_id DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting recent additions:', error);
    throw error;
  }
}

// Exporta todas as funções de uma vez
module.exports = {
  getClassifications,
  getClassificationByName,
  addClassification,
  getInventoryItemById,
  addInventory,
  getRecentAdditions
};
