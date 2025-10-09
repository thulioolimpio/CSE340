const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator") // Importado para lidar com erros de validação
const reviewUtil = require("../utilities/review-utilities") // NOVO: Importa utilities de review

/* ************************
 * Deliver Login view
 ************************ */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ************************
 * Deliver Registration view
 ************************ */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hachura a senha antes de armazená-la no banco
    let hashedPassword
    try {
        const salt = await bcrypt.genSalt(10)
        hashedPassword = await bcrypt.hash(account_password, salt)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
        return
    }

    // Chama a função do model para inserir no banco, usando a senha HACHURADA
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword 
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

/* ****************************************
 * Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }

    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            
            delete accountData.account_password
            
            // Criação do JWT (inclui dados essenciais como ID e tipo para res.locals)
            const accessToken = utilities.buildToken(accountData)
            
            // Criação do Cookie
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            
            // Redirecionamento de Sucesso
            return res.redirect("/account/")
            
        } else {
            // FALHA: Senha Incorreta
            req.flash("notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error("Access Forbidden")
    }
}

/* ****************************************
 * Deliver Account Management View (Seguro)
 * *************************************** */
async function buildAccountManagement(req, res, next) {
    try {
        const nav = await utilities.getNav() 
        const accountData = res.locals.accountData || null
        const account_id = res.locals.account_id 
        
        let clientReviewsHTML = ""

        // NOVO: Lógica assíncrona para buscar as reviews
        if (account_id) {
            try {
                clientReviewsHTML = await reviewUtil.buildAccountReviewsList(account_id);
            } catch (error) {
                console.error("Error fetching client reviews:", error);
                clientReviewsHTML = "<p class='notice'>Could not load your reviews due to an error.</p>";
            }
        }

        res.render("account/management", {
            title: "Account Management",
            nav,
            errors: null, 
            accountData: accountData, // Dados para a view
            clientReviewsHTML: clientReviewsHTML // NOVO: Passa o HTML das reviews gerado de forma assíncrona
        })
    } catch (error) {
        console.error("buildAccountManagement error:", error)
        next(error)
    }
}

// ---------------------------------------------------
// NOVAS FUNÇÕES PARA ATUALIZAÇÃO (TASK 5 & 6)
// ---------------------------------------------------

/* ****************************************
 * Deliver update account view
 * ****************************************/
async function buildUpdateAccount(req, res, next) {
    const account_id = parseInt(req.params.account_id)
    let nav = await utilities.getNav()

    // Busca os dados completos da conta pelo ID
    const accountData = await accountModel.getAccountById(account_id)

    // Se a busca falhar ou o ID não corresponder ao logado (segurança extra)
    if (!accountData || res.locals.account_id !== accountData.account_id) {
        req.flash("error", "Access denied or account not found.")
        return res.redirect("/account/")
    }

    res.render("account/account-update", {
        title: "Update Account Information",
        nav,
        errors: null,
        accountData: accountData, // Dados para preencher o formulário
    })
}

/* ****************************************
 * Process account update (Name/Email)
 * ****************************************/
async function updateAccountInfo(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body

    // A validação de erros já foi tratada pelo middleware checkUpdateData

    const updateResult = await accountModel.updateAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    )

    if (updateResult) {
        // Sucesso: Atualiza o JWT e o cookie, pois os dados (nome/email) mudaram
        const updatedAccountData = await accountModel.getAccountById(account_id)
        
        // Crie um novo JWT e redefina o cookie!
        const newJwt = utilities.buildToken(updatedAccountData); 
        res.cookie("jwt", newJwt, { httpOnly: true, maxAge: 3600 * 1000 });
        
        req.flash("success", "Account information updated successfully.")
        res.redirect("/account/") // Redireciona para a view de gerenciamento
    } else {
        // Falha no DB
        req.flash("error", "Sorry, the update failed.")
        // Retorna para a view de atualização com dados atuais/sticky
        res.redirect("/account/update/" + account_id)
    }
}

/* ****************************************
 * Process password change
 * ****************************************/
async function changePassword(req, res) {
    const { account_password, account_id } = req.body
    
    // A validação de erros já foi tratada pelo middleware checkUpdateData

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(account_password, 10)
    
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

    if (updateResult) {
        req.flash("success", "Password successfully updated.")
    } else {
        req.flash("error", "Sorry, the password change failed.")
    }

    res.redirect("/account/") // Redireciona para a view de gerenciamento
}

/* ****************************************
 * Log out client and clear JWT cookie (TASK 6)
 * ****************************************/
async function accountLogout(req, res) {
    // 1. Apaga (limpa) o cookie JWT
    res.clearCookie("jwt"); 
    
    // 2. Define o status de deslogado para a view de header (res.locals.loggedin = 0)
    // Isso é tratado pelo middleware de JWT na próxima requisição, mas limpar o cookie é o essencial.

    // 3. Redireciona para a home view
    req.flash("success", "You have been logged out.")
    res.redirect("/");
}


module.exports = { 
    buildLogin, 
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccountManagement,
    buildUpdateAccount, // Novo
    updateAccountInfo,  // Novo
    changePassword,     // Novo
    accountLogout       // Novo
}
