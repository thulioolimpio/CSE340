const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const utilities = require('../utilities');

// Vehicle Detail Route
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Error Test Route
router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional 500 Error - Test"));
});

module.exports = router;