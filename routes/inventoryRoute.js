const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail))

// Route to intentionally trigger a 500 error (Task 3)
router.get("/error", utilities.handleErrors(invController.triggerError))

module.exports = router
