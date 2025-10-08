const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")
// NOVO: Importa o middleware de autorização de inventário
const { checkEmployeeOrAdmin } = require("../utilities/inventory-middleware") 

// ----------------------
// Existing routes (Client Views - NÃO REQUER AUTORIZAÇÃO)
// ----------------------
// Build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail))

// Route to intentionally trigger a 500 error
router.get("/error", utilities.handleErrors(invController.triggerError))

// ----------------------
// Management & Add Routes (REQUER AUTORIZAÇÃO)
// ----------------------
// Management view (GET /inv/)
router.get("/", 
    checkEmployeeOrAdmin, // <--- Protegido
    utilities.handleErrors(invController.buildManagement)
)

// Add classification view
router.get("/add-classification", 
    checkEmployeeOrAdmin, // <--- Protegido
    utilities.handleErrors(invController.buildAddClassification)
)

// Add inventory view
router.get("/add-inventory", 
    checkEmployeeOrAdmin, // <--- Protegido
    utilities.handleErrors(invController.buildAddInventory)
)

// Process add-classification (POST)
router.post(
    "/add-classification",
    checkEmployeeOrAdmin, // <--- Protegido
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Process add-inventory (POST)
router.post(
    "/add-inventory",
    checkEmployeeOrAdmin, // <--- Protegido
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// ----------------------
// AJAX/API Routes (NÃO REQUER AUTORIZAÇÃO)
// ----------------------
// Route for getting inventory as JSON for JavaScript (GET /inv/getInventory/id)
router.get(
    "/getInventory/:classification_id", 
    utilities.handleErrors(invController.getInventoryJSON)
)

// ----------------------
// Update/Edit Routes (REQUER AUTORIZAÇÃO)
// ----------------------
// Route for building the edit inventory view (GET /inv/edit/id)
router.get(
    "/edit/:invId", 
    checkEmployeeOrAdmin, // <--- Protegido
    utilities.handleErrors(invController.buildEditView)
)

// Route to handle the submitted updated inventory data
router.post(
    "/update", 
    checkEmployeeOrAdmin, // <--- Protegido
    invValidate.inventoryRules(), 
    invValidate.checkUpdateData, 
    utilities.handleErrors(invController.updateInventory)
)

module.exports = router