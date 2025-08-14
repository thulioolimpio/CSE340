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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

const vehicleUpload = upload.fields([
  { name: 'inv_image', maxCount: 1 },
  { name: 'inv_thumbnail', maxCount: 1 }
]);

/* ===================
   Controller Functions
   =================== */

// Build inventory management view
async function buildManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const recentAdditions = await invModel.getRecentAdditions();
    
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      recentAdditions,
      messages: req.flash()
    });
  } catch (error) {
    next(error);
  }
}

// Build classification view
async function buildByClassificationId(req, res, next) {
  try {
    const classificationId = parseInt(req.params.classificationId);
    if (isNaN(classificationId)) throw new Error('Invalid classification ID');

    const data = await invModel.getInventoryByClassificationId(classificationId);
    const nav = await utilities.getNav();
    const className = data.length > 0 ? data[0].classification_name : '';

    res.render('inventory/classification', {
      title: className + ' vehicles',
      nav,
      grid: data,
      messages: req.flash()
    });
  } catch (error) {
    next(error);
  }
}

// Build vehicle detail view
async function buildByInvId(req, res, next) {
  try {
    const invId = parseInt(req.params.invId);
    if (isNaN(invId)) throw new Error('Invalid vehicle ID');

    const data = await invModel.getInventoryItemById(invId);
    if (!data) {
      req.flash('error', 'Vehicle not found');
      return res.redirect('/inv');
    }

    const nav = await utilities.getNav();
    const detailHTML = utilities.buildDetailView(data);

    res.render('inventory/detail', {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detailHTML,
      messages: req.flash()
    });
  } catch (error) {
    next(error);
  }
}

// Build add classification view
async function buildAddClassification(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render('inventory/add-classification', {
      title: 'Add New Classification',
      nav,
      errors: null,
      messages: req.flash(),
      classification_name: ''
    });
  } catch (error) {
    next(error);
  }
}

// Process classification form
async function addClassification(req, res, next) {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: errors.array(),
      classification_name,
      messages: req.flash()
    });
  }

  try {
    const exists = await invModel.getClassificationByName(classification_name);
    if (exists) {
      req.flash('error', 'Classification already exists');
      const nav = await utilities.getNav();
      return res.render('inventory/add-classification', {
        title: 'Add Classification',
        nav,
        errors: [{ msg: 'Classification already exists' }],
        classification_name,
        messages: req.flash()
      });
    }

    const newClassification = await invModel.addClassification(classification_name);
    req.flash('success', `Classification "${newClassification.classification_name}" added successfully!`);
    res.redirect('/inv');
  } catch (error) {
    console.error('Error adding classification:', error);
    req.flash('error', error.message);
    const nav = await utilities.getNav();
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: [{ msg: error.message }],
      classification_name,
      messages: req.flash()
    });
  }
}

// Build add inventory view
async function buildAddInventory(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    
    res.render('inventory/add-inventory', {
      title: 'Add New Vehicle',
      nav,
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

// Inventory validation rules
const inventoryValidationRules = [
  body('classification_id')
    .notEmpty().withMessage('Classification is required')
    .isInt().withMessage('Invalid classification'),
  
  body('inv_make')
    .notEmpty().withMessage('Make is required')
    .isLength({ min: 3 }).withMessage('Make must be at least 3 characters'),
  
  body('inv_model')
    .notEmpty().withMessage('Model is required')
    .isLength({ min: 3 }).withMessage('Model must be at least 3 characters'),
  
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
];

// Process inventory form
async function addInventory(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    return res.render('inventory/add-inventory', {
      title: 'Add New Vehicle',
      nav,
      classifications,
      errors: errors.array(),
      formData: req.body,
      messages: req.flash()
    });
  }

  try {
    const inventoryData = {
      classification_id: parseInt(req.body.classification_id),
      inv_make: req.body.inv_make.trim(),
      inv_model: req.body.inv_model.trim(),
      inv_year: parseInt(req.body.inv_year),
      inv_price: parseFloat(req.body.inv_price),
      inv_miles: parseInt(req.body.inv_miles),
      inv_color: req.body.inv_color.trim(),
      inv_description: req.body.inv_description?.trim() || '',
      inv_image: req.files?.inv_image ? `/images/vehicles/${req.files.inv_image[0].filename}` : '/images/vehicles/no-image.jpg',
      inv_thumbnail: req.files?.inv_thumbnail ? `/images/vehicles/${req.files.inv_thumbnail[0].filename}` : '/images/vehicles/no-image-tn.jpg'
    };

    const newId = await invModel.addInventory(inventoryData);
    req.flash('success', 'Vehicle added successfully!');
    res.redirect('/inv');
  } catch (error) {
    console.error('Error adding vehicle:', error);
    
    if (req.files) {
      for (const fileArray of Object.values(req.files)) {
        for (const file of fileArray) {
          fs.unlink(file.path, err => err && console.error('Error deleting file:', err));
        }
      }
    }

    const nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();
    
    return res.render('inventory/add-inventory', {
      title: 'Add New Vehicle',
      nav,
      classifications,
      errors: [{ msg: error.message }],
      formData: req.body,
      messages: req.flash()
    });
  }
}

/* ===================
   Module Exports
   =================== */
module.exports = {
  buildManagement,
  buildByClassificationId,
  buildByInvId,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
  inventoryValidationRules,
  vehicleUpload
};