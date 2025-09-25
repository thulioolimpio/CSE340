/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const path = require('path')

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

const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")

// DEBUG: Verificar variáveis
console.log("=== Variáveis de Ambiente ===")
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("PORT:", process.env.PORT)
console.log("DATABASE_URL:", process.env.DATABASE_URL || "NÃO ENCONTRADA")
console.log("==============================")


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
