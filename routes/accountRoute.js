const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")

// =======================
//  Account Routes
// =======================

// Build login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  accountValidate.registationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
