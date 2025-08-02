// routes/index.js
const express = require("express");
const router = express.Router();
const utilities = require("../utilities");

router.get("/", async (req, res, next) => {
  try {
    const nav = await utilities.getNav();
    res.render("index", {
      title: "Welcome to CSE Motors",
      nav,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

router.get("/trigger-error", (req, res, next) => {
  try {
    // Intentionally cause an error
    throw new Error("This is a 500 error triggered intentionally");
  } catch (error) {
    next(error);
  }
});