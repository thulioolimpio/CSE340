// routes/accountRoute.js
const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const accountValidate = require("../utilities/account-validation")

// =======================
//  Account Routes
// =======================

// Build login view
router.get(
    "/login",
    utilities.handleErrors(accountController.buildLogin)
)

// Build registration view
router.get(
    "/register",
    utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
    "/register",
    accountValidate.registrationRules(), 
    accountValidate.checkRegData,      
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
    "/login",
    accountValidate.loginRules(), 
    accountValidate.checkLoginData,  
    utilities.handleErrors(accountController.accountLogin)
)

// Default Account Management route (Protegida)
router.get(
    "/",
    utilities.checkLogin,     // Garante que o usuário está logado
    utilities.handleErrors(accountController.buildAccountManagement)
)

// Rota GET para a view de atualização de conta (Task 5)
// Deve passar o account_id como parâmetro
router.get(
    "/update/:account_id",
    utilities.checkLogin, 
    utilities.handleErrors(accountController.buildUpdateAccount)
);

// Rota POST para processar a atualização de informações de conta (Task 5)
router.post(
    "/update",
    utilities.checkLogin,
    accountValidate.updateAccountRules(), // Regras para nome/email
    accountValidate.checkUpdateData,      // Checa erros e retorna para a view
    utilities.handleErrors(accountController.updateAccountInfo)
);

// Rota POST para processar a mudança de senha (Task 5)
router.post(
    "/change-password",
    utilities.checkLogin,
    accountValidate.changePasswordRules(), // Regras para a nova senha
    accountValidate.checkUpdateData,       // Checa erros e retorna para a view
    utilities.handleErrors(accountController.changePassword)
);

// Rota GET para Logout (Task 6)
router.get(
    "/logout",
    utilities.handleErrors(accountController.accountLogout)
);


module.exports = router