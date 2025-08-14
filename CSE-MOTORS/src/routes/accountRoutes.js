const express = require('express')
const router = express.Router()
const accountCtrl = require('../controllers/accountController')
const { requireAuth } = require('../middleware/auth')
const { loginValidator, registerValidator } = require('../validators/accountValidator')

// === Login ===
router.get('/login', accountCtrl.buildLoginView)
router.post('/login', loginValidator, accountCtrl.loginUser)

// === Registro ===
router.get('/register', accountCtrl.buildRegisterView)
router.post('/register', registerValidator, accountCtrl.registerUser)

// === Logout ===
router.get('/logout', requireAuth(), accountCtrl.logout)

// === Gestão de conta (já tínhamos) ===
router.get('/management', requireAuth(), accountCtrl.buildManagement)

module.exports = router
