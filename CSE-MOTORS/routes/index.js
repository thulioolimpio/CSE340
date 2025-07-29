const express = require("express");
const router = express.Router();

// Existing routes...

// Intentional error route
router.get("/trigger-error", (req, res, next) => {
  try {
    // Intentionally cause an error
    throw new Error("Intentional 500 error triggered");
  } catch (error) {
    next(error);
  }
});

module.exports = router;