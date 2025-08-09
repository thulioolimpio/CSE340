const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const { body } = require('express-validator');

// Rotas de Classificação
router.get('/add-classification', invController.buildAddClassification);
router.post('/add-classification', invController.addClassification);

// Rotas de Veículos
router.get('/add-inventory', invController.buildAddInventory);

// Validação para o formulário de veículo (usando as regras do controller)
const validateInventory = invController.inventoryValidationRules;

// Rota para processar o formulário de veículo (versão corrigida)
router.post(
  '/add-inventory',
  invController.vehicleUpload, // Middleware de upload corrigido
  validateInventory,
  invController.addInventory
);

// Rota de detalhes do veículo
router.get('/detail/:invId', invController.buildByInvId);

module.exports = router;