/* ******************************************
 * server.js - Arquivo principal do projeto
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const inventoryRoute = require("./routes/inventoryRoute") 
const reviewRoute = require("./routes/reviewRoute") // Rota de Reviews
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const expressLayouts = require("express-ejs-layouts")
const path = require('path')
// CORRIGIDO: O nome correto do módulo é "body-parser"
const bodyParser = require("body-parser") 
const cookieParser = require("cookie-parser")
const flash = require('connect-flash')

// Carregar dotenv
require('dotenv').config({ path: path.join(__dirname, '.env') })

// DEBUG: Verificar arquivo .env (Removido o console.log extenso para limpeza)
const fs = require('fs')
const envPath = path.join(__dirname, '.env')
console.log('=== Database Connection ===')
console.log('NODE_ENV:', process.env.NODE_ENV)


const app = express()

/* ***********************
 * Middleware
 *************************/
// Cookie Parser (necessário para JWT)
app.use(cookieParser())

// Body Parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Session com PostgreSQL
app.use(session({
    store: new (require('connect-pg-simple')(session))({
        createTableIfMissing: true,
        pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    name: 'sessionId',
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}))

// Flash Messages
app.use(flash())
app.use((req, res, next) => {
    // Middleware para tornar o helper 'messages' disponível
    res.locals.messages = require('express-messages')(req, res)
    // Variáveis locals para o status de login
    res.locals.loggedin = req.session.loggedin
    res.locals.account_id = req.session.account_id
    res.locals.account_firstname = req.session.account_firstname
    res.locals.account_type = req.session.account_type
    
    // Variáveis para flash (alternativa ao express-messages, se necessário)
    res.locals.flash = {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info')
    }
    next()
})

// JWT Middleware seguro
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Layouts
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Static files
 *************************/
app.use(static)
app.use(express.static(path.join(__dirname, 'public')))

/* ***********************
 * Routes
 *************************/
// Index
app.get("/", utilities.handleErrors(baseController.buildHome))

// Account Routes
app.use("/account", accountRoute)

// Inventory Routes
app.use("/inv", inventoryRoute)

// Review Routes
app.use("/review", reviewRoute) 

/* ***********************
 * 404 Not Found
 *************************/
app.use(async (req, res, next) => {
    next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
 * Error Handler
 *************************/
app.use(async (err, req, res, next) => {
    let nav = await utilities.getNav()
    console.error(`Error at: "${req.originalUrl}": ${err.message}`)
    let message
    if (err.status == 404) {
        message = err.message
    } else {
        message = 'Oh no! There was a crash. Maybe try a different route?'
    }
    res.render("errors/error", {
        title: err.status || 'Server Error',
        message,
        nav
    })
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

app.listen(port, () => {
    console.log(`app listening on ${host}:${port}`)
})
