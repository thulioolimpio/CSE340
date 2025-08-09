const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const invController = require("../controllers/inventoryController");

// Rota principal
router.get("/", utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav();
  res.render("index", {
    title: "Welcome to CSE Motors",
    nav,
    current: 'home'
  });
}));

// Rota para /inv (Inventory)
router.get("/inv", utilities.handleErrors(async (req, res) => {
  const nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    current: 'inventory'
  });
}));

// Rota de erro de teste
router.get("/trigger-error", utilities.handleErrors(async (req, res) => {
  throw new Error("This is a 500 error triggered intentionally");
}));

module.exports = router;