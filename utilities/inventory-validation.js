const utilities = require(".")
const { body, validationResult } = require("express-validator")

const invValidate = {}

// Classification Validation
invValidate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Please provide a classification name with at least 3 characters."),
    ]
}

invValidate.checkClassificationData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name: req.body.classification_name,
        })
        return
    }
    next()
}

// Inventory Validation Rules (Used for both Add and Update)
invValidate.inventoryRules = () => {
    return [
        body("inv_make").trim().isLength({ min: 2 }).withMessage("Please provide the vehicle make."),
        body("inv_model").trim().isLength({ min: 1 }).withMessage("Please provide the vehicle model."),
        body("inv_description").trim().isLength({ min: 10 }).withMessage("Please provide a description of at least 10 characters."),
        body("inv_image").trim().notEmpty().withMessage("Please provide an image path."),
        body("inv_thumbnail").trim().notEmpty().withMessage("Please provide a thumbnail path."),
        body("inv_price").isFloat({ min: 0 }).withMessage("Please provide a valid price."),
        body("inv_year").isInt({ min: 1900 }).withMessage("Please provide a valid year."),
        body("inv_miles").isInt({ min: 0 }).withMessage("Please provide valid mileage."),
        body("classification_id").notEmpty().withMessage("Please select a classification."),
    ]
}

invValidate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationSelect,
            ...req.body,
        })
        return
    }
    next()
}

// ---------------------------------
// Check update data and return errors to the Edit View (NOVA FUNÇÃO)
// ---------------------------------
invValidate.checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const itemName = `${req.body.inv_make} ${req.body.inv_model}`
        let nav = await utilities.getNav()
        
        // Re-build the classification list, ensuring the current classification_id is selected
        const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
        
        // Render the edit-inventory view, making it 'sticky' with all submitted data
        res.render("inventory/edit-inventory", {
            errors,
            // Título formatado para a view de edição
            title: "Edit " + itemName,
            nav,
            classificationSelect,
            // Inclui todos os dados, inclusive o inv_id para o campo hidden
            ...req.body,
        })
        return
    }
    next()
}

module.exports = invValidate