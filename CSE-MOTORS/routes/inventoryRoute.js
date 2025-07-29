// routes/inventoryRoute.js
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Exibir detalhe de veículo pelo ID
router.get("/detail/:inv_id", invController.buildById);

// Rota para erro 500 intencional
router.get("/trigger-error", (req, res) => {
  throw new Error("Erro intencional de servidor.");
});

module.exports = router;
