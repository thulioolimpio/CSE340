const { check, validationResult } = require('express-validator');
const utilities = require('./index');
const invModel = require('../models/inventory-model'); // Adicionado

// ... (restante do código permanece igual) ...
// Regras de validação para classificação
exports.classificationRules = () => {
  return [
    check('classification_name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Classification name is required')
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage('No spaces or special characters allowed')
      .isLength({ max: 30 })
      .withMessage('Classification name must be less than 30 characters')
  ];
};

// Middleware para verificação dos dados da classificação
exports.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: errors.array(),
      classification_name: req.body.classification_name
    });
  }
  next();
};

// Regras de validação para inventário (veículo)
exports.inventoryRules = () => {
  return [
    check('classification_id')
      .notEmpty()
      .withMessage('Classification is required')
      .isInt()
      .withMessage('Invalid classification'),
    
    check('inv_make')
      .trim()
      .notEmpty()
      .withMessage('Make is required')
      .isLength({ min: 3 })
      .withMessage('Make must be at least 3 characters')
      .isLength({ max: 50 })
      .withMessage('Make must be less than 50 characters'),
    
    check('inv_model')
      .trim()
      .notEmpty()
      .withMessage('Model is required')
      .isLength({ min: 3 })
      .withMessage('Model must be at least 3 characters')
      .isLength({ max: 50 })
      .withMessage('Model must be less than 50 characters'),
    
    check('inv_year')
      .notEmpty()
      .withMessage('Year is required')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
    
    check('inv_price')
      .notEmpty()
      .withMessage('Price is required')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    
    check('inv_miles')
      .notEmpty()
      .withMessage('Mileage is required')
      .isInt({ min: 0 })
      .withMessage('Mileage must be a positive number'),
    
    check('inv_color')
      .trim()
      .notEmpty()
      .withMessage('Color is required')
      .isLength({ max: 30 })
      .withMessage('Color must be less than 30 characters'),
    
    check('inv_description')
      .optional({ checkFalsy: true })
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
  ];
};

// Middleware para verificação dos dados do veículo
exports.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      const nav = await utilities.getNav();
      const classificationResult = await invModel.getClassifications(); // Usando diretamente o model
      
      return res.render('inventory/add-inventory', {
        title: 'Add New Vehicle',
        nav,
        classifications: classificationResult.rows || [],
        formData: req.body,
        errors: errors.array()
      });
    } catch (error) {
      console.error('Error in checkInventoryData:', error);
      req.flash('error', 'Error loading form data');
      return res.redirect('/inv/add-inventory');
    }
  }
  next();
};