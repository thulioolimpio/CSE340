const express = require('express');
const router = express.Router();
const invController = require('../controllers/inventoryController');
const { body } = require('express-validator');

// Rotas de Gerenciamento
router.get('/', invController.buildManagement);
router.get('/management', invController.buildManagement);

// Rotas de Classificação
router.get('/add-classification', invController.buildAddClassification);
router.post('/add-classification', invController.addClassification);

// Rotas de Veículos
router.get('/add-inventory', invController.buildAddInventory);

router.get('/management', async (req, res) => {
  // Recuperar mensagem da sessão
  const message = req.session.message;
  // Limpar mensagem após recuperar
  delete req.session.message;

  res.render('inventory/management', {
    title: 'Inventory Management',
    nav: await utilities.getNav(),
    messages: message ? [message] : []
  });
});

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