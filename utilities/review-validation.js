// utilities/review-validation.js
const utilities = require(".")
const { body } = require("express-validator")

const validate = {}

/* **********************************
 * Review Submission Validation Rules
 * ********************************* */
validate.reviewRules = () => {
    return [
        body("review_text")
            .trim()
            .notEmpty()
            .withMessage("Please provide a review text.")
            .isLength({ min: 1, max: 500 })
            .withMessage("Review must be between 1 and 500 characters."),
        
        // Validação implícita de inv_id e account_id (existência)
    ]
}

/* **********************************
 * Check Review Data and return errors
 * ********************************* */
validate.checkReviewData = async (req, res, next) => {
    const { review_text, inv_id } = req.body
    const { validationResult } = require("express-validator")
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const invModel = require("../models/inventory-model")
        const vehicleData = await invModel.getInventoryByInvId(inv_id)
        
        // Importa o util de reviews para renderizar a view com erro
        const reviewUtil = require("./review-utilities")
        const reviewsHTML = await reviewUtil.buildVehicleReviews(inv_id);
        
        // Esta renderização deve ocorrer no Controller de Inventário para re-exibir a página de detalhes
        res.status(400).render("inventory/detail", {
            title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
            nav,
            errors,
            vehicle: vehicleData,
            reviewsHTML,
            review_text, // Mantém o texto submetido
            inv_id,
            account_id: res.locals.account_id
        })
        return
    }
    next()
}

module.exports = validate