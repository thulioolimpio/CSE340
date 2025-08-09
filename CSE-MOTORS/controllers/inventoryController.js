const path = require('path');
const utilities = require('../utilities');
const invModel = require('../models/inventory-model');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require('fs');

/* ===================
   Multer Configuration
   =================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images/vehicles'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configuração corrigida do Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Middleware específico para upload de veículos
const vehicleUpload = upload.fields([
  { name: 'inv_image', maxCount: 1 },
  { name: 'inv_thumbnail', maxCount: 1 }
]);

/* ===================
   Controller Functions
   =================== */

/**
 * Display vehicle details
 */
async function buildByInvId(req, res, next) {
  try {
    const invId = parseInt(req.params.invId);
    if (isNaN(invId)) throw new Error('Invalid vehicle ID');

    const data = await invModel.getInventoryItemById(invId);
    if (!data) {
      req.flash('error', 'Vehicle not found');
      return res.redirect('/inv');
    }

    const detailHTML = await utilities.buildDetailView(data);
    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      detailHTML,
      nav: await utilities.getNav(),
      messages: req.flash()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Display management dashboard
 */
async function buildManagement(req, res, next) {
  try {
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav: await utilities.getNav(),
      messages: req.flash()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Display classification form
 */
async function buildAddClassification(req, res, next) {
  try {
    res.render('inventory/add-classification', {
      title: 'Add New Classification',
      nav: await utilities.getNav(),
      errors: null,
      messages: req.flash(),
      classification_name: ''
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process classification form submission
 */
async function addClassification(req, res, next) {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav: await utilities.getNav(),
      errors: errors.array(),
      classification_name,
      messages: req.flash()
    });
  }

  try {
    const exists = await invModel.getClassificationByName(classification_name);
    if (exists) {
      req.flash('error', 'Classification already exists');
      return res.render('inventory/add-classification', {
        title: 'Add Classification',
        nav: await utilities.getNav(),
        errors: [{ msg: 'Classification already exists' }],
        classification_name,
        messages: req.flash()
      });
    }

    const newClassification = await invModel.addClassification(classification_name);
    req.flash('success', `Classification "${newClassification.classification_name}" added successfully!`);
    res.redirect('/inv/management');
  } catch (error) {
    console.error('Error adding classification:', error);
    req.flash('error', error.message);
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav: await utilities.getNav(),
      errors: [{ msg: error.message }],
      classification_name,
      messages: req.flash()
    });
  }
}

/**
 * Display add vehicle form
 */
async function buildAddInventory(req, res, next) {
  try {
    const classifications = await invModel.getClassifications();
    
    res.render('inventory/add-inventory', {
      title: 'Add New Vehicle',
      nav: await utilities.getNav(),
      classifications,
      errors: null,
      messages: req.flash(),
      formData: {
        inv_make: '',
        inv_model: '',
        inv_year: '',
        inv_description: '',
        inv_image: '/images/vehicles/no-image.jpg',
        inv_thumbnail: '/images/vehicles/no-image-tn.jpg',
        inv_price: '',
        inv_miles: '',
        inv_color: '',
        classification_id: ''
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Validation rules for inventory items
 */
const inventoryValidationRules = [
  body('classification_id')
    .notEmpty().withMessage('Classification is required')
    .isInt().withMessage('Invalid classification'),
  
  body('inv_make')
    .notEmpty().withMessage('Make is required')
    .isLength({ min: 3 }).withMessage('Make must be at least 3 characters')
    .trim().escape(),
  
  body('inv_model')
    .notEmpty().withMessage('Model is required')
    .isLength({ min: 3 }).withMessage('Model must be at least 3 characters')
    .trim().escape(),
  
  body('inv_year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
  
  body('inv_price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  
  body('inv_miles')
    .notEmpty().withMessage('Mileage is required')
    .isInt({ min: 0 }).withMessage('Mileage must be positive'),
  
  body('inv_color')
    .notEmpty().withMessage('Color is required')
    .trim().escape()
];

/**
 * Process vehicle form submission
 */
async function addInventory(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const classifications = await invModel.getClassifications();
    req.flash('error', 'Please correct the errors in the form');
    return res.render('inventory/add-inventory', {
      title: 'Add New Vehicle',
      nav: await utilities.getNav(),
      classifications,
      errors: errors.array(),
      formData: req.body,
      messages: req.flash()
    });
  }

  try {
    if (!req.files?.inv_image || !req.files?.inv_thumbnail) {
      throw new Error('Both main image and thumbnail are required');
    }

    const inventoryData = {
      classification_id: parseInt(req.body.classification_id),
      inv_make: req.body.inv_make.trim(),
      inv_model: req.body.inv_model.trim(),
      inv_year: parseInt(req.body.inv_year),
      inv_price: parseFloat(req.body.inv_price),
      inv_miles: parseInt(req.body.inv_miles),
      inv_color: req.body.inv_color.trim(),
      inv_description: req.body.inv_description?.trim() || '',
      inv_image: `/images/vehicles/${req.files.inv_image[0].filename}`,
      inv_thumbnail: `/images/vehicles/${req.files.inv_thumbnail[0].filename}`
    };

    const newId = await invModel.addInventory(inventoryData);
    const addedVehicle = await invModel.getInventoryItemById(newId);
    
    if (!addedVehicle) throw new Error('Failed to retrieve added vehicle');

    // MENSAGEM DE SUCESSO - FORMA GARANTIDA
    req.session.flash = {
      type: 'success',
      message: `Vehicle ${addedVehicle.inv_make} ${addedVehicle.inv_model} added successfully!`
    };
    
    return res.redirect('/inv/management');

  } catch (error) {
    console.error('Error adding vehicle:', error);

    // Limpar arquivos em caso de erro
    if (req.files) {
      for (const fileArray of Object.values(req.files)) {
        for (const file of fileArray) {
          fs.unlink(file.path, err => err && console.error('Error deleting file:', err));
        }
      }
    }

    const classifications = await invModel.getClassifications();
    
    req.session.flash = {
      type: 'error',
      message: error.message
    };
    
    return res.render('inventory/add-inventory', {
      title: 'Add New Vehicle',
      nav: await utilities.getNav(),
      classifications,
      errors: [{ msg: error.message }],
      formData: req.body,
      messages: req.session.flash
    });
  }
}

/* ===================
   Module Exports
   =================== */
module.exports = {
  buildByInvId,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
  inventoryValidationRules,
  vehicleUpload  // Exportando o middleware configurado corretamente
};