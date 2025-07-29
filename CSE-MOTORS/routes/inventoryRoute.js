const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');

// Rota para exibir o detalhe de um veículo
router.get('/detail/:inv_id', invController.buildDetailView);

// Rota intencional para erro 500
router.get('/trigger-error', (req, res, next) => {
  next(new Error("Erro intencional gerado para teste."));
});

module.exports = router;
