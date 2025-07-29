const express = require("express");
const router = express.Router();
const invController = require("../controllers/inventoryController");

// Existing classification route
router.get("/type/:classificationId", invController.buildByClassificationId);

// New detail route
router.get("/detail/:invId", invController.buildByInventoryId);

module.exports = router;