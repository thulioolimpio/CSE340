/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const path = require('path')
const expressLayouts = require("express-ejs-layouts")
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const bodyParser = require("body-parser") // ✅ body-parser adicionado

// Carregar dotenv com caminho absoluto
require('dotenv').config({ path: path.join(__dirname, '.env') })

// DEBUG: Verificar se o arquivo .env existe
const fs = require('fs')
const envPath = path.join(__dirname, '.env')
console.log('=== Verificando arquivo .env ===')
console.log('Caminho do .env:', envPath)
console.log('.env existe?', fs.existsSync(envPath))

if (fs.existsSync(envPath)) {
  console.log('Conteúdo do .env:')
  console.log(fs.readFileSync(envPath, 'utf8'))
} else {
  console.log('❌ ARQUIVO .env NÃO ENCONTRADO!')
}
console.log('================================')

// DEBUG: Verificar variáveis
console.log("=== Variáveis de Ambiente ===")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("PORT:", process.env.PORT)
console.log("DATABASE_URL:", process.env.DATABASE_URL || "NÃO ENCONTRADA")
console.log("==============================")

const app = express()

/* ***********************
 * Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// ✅ Body Parser para processar dados de formulário e JSON
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)
app.use(express.static(path.join(__dirname, 'public')))
app.use("/account", accountRoute)

// session + flash (needed for flash messages)
const flash = require('connect-flash')

// configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_on_deploy',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
  })
)
// initialize flash
app.use(flash())

// Make flash messages available to all views via res.locals
app.use((req, res, next) => {
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  }
  next()
})


// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
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
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

/* ***********************
 * Start Server
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
