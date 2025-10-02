const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// ----------------------
// Existing routes
// ----------------------
// Build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail))

// Route to intentionally trigger a 500 error
router.get("/error", utilities.handleErrors(invController.triggerError))

// ----------------------
// Assignment 4 - NEW Routes
// ----------------------
// Management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// Add classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

// Add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

// Process add-classification
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Process add-inventory
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router
