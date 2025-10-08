// utilities/account-validation.js
const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

const validate = {}

/* **********************************
 * Registration Data Validation Rules
 ********************************* */
validate.registrationRules = () => {
    return [
        body("account_firstname").trim().escape().notEmpty().withMessage("Please provide a first name."),
        body("account_lastname").trim().escape().notEmpty().isLength({ min: 2 }).withMessage("Please provide a last name."),
        body("account_email")
            .trim().escape().notEmpty().isEmail().normalizeEmail().withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email already exists. Please login or use a different email.")
                }
            }),
        body("account_password").trim().notEmpty()
            .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, })
            .withMessage("Password does not meet requirements."),
    ]
}

/* **********************************
 * Login Data Validation Rules
 ********************************* */
validate.loginRules = () => {
    return [
        body("account_email").trim().notEmpty().isEmail().normalizeEmail().withMessage("Please provide a valid email."),
        body("account_password").trim().notEmpty().isLength({ min: 12 }).withMessage("Please provide a valid password."),
    ]
}

/* **********************************
 * Account Update Validation Rules
 ********************************* */
validate.updateAccountRules = () => {
    return [
        body("account_firstname").trim().escape().notEmpty().withMessage("Please provide a first name."),
        body("account_lastname").trim().escape().notEmpty().isLength({ min: 2 }).withMessage("Please provide a last name."),
        body("account_email")
            .trim().escape().notEmpty().isEmail().normalizeEmail().withMessage("A valid email is required.")
            .custom(async (account_email, { req }) => {
                const account_id = req.body.account_id
                const account = await accountModel.getAccountById(account_id)
                
                // 1. Se o email não mudou, está OK.
                if (account_email === account.account_email) {
                    return true
                }
                
                // 2. Se o email mudou, verifique se o novo já existe.
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email already exists. Please use a different email.")
                }
            }),
    ]
}

/* **********************************
 * Change Password Validation Rules
 ********************************* */
validate.changePasswordRules = () => {
    return [
        body("account_password").trim().notEmpty()
            .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, })
            .withMessage("Password does not meet requirements."),
    ]
}


/* **********************************
 * Check registration data and return errors
 ********************************* */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors, title: "Registration", nav, account_firstname, account_lastname, account_email,
        })
        return
    }
    next()
}

/* **********************************
 * Check login data and return errors
 ********************************* */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors, title: "Login", nav, account_email,
        })
        return
    }
    next()
}

/* **********************************
 * Check Update Data and return errors
 ********************************* */
validate.checkUpdateData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_id } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        // Buscar os dados originais é crucial para manter o estado da view
        const accountData = await accountModel.getAccountById(account_id) 
        
        const title = req.originalUrl.includes("change-password") ? "Change Password" : "Update Account Information";

        res.render("account/account-update", {
            title,
            nav,
            errors: errors.array(),
            accountData,
            // Valores sticky
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

module.exports = validate