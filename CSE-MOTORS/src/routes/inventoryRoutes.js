const express = require('express')
const router = express.Router()
const { requireEmployeeOrAdmin } = require('../middleware/auth')
const invCtrl = require('../controllers/inventoryController')

// *** ABERTAS ao público (NÃO usar middleware): ***
router.get('/classification/:slug', invCtrl.buildClassification)
router.get('/detail/:id', invCtrl.buildDetail)

// *** RESTRITAS (usar middleware): ***
router.get('/manage', requireEmployeeOrAdmin(), invCtrl.buildManagement)
router.get('/add', requireEmployeeOrAdmin(), invCtrl.buildAddView)
router.post('/add', requireEmployeeOrAdmin(), invCtrl.createItem)
router.get('/edit/:id', requireEmployeeOrAdmin(), invCtrl.buildEditView)
router.post('/edit/:id', requireEmployeeOrAdmin(), invCtrl.updateItem)
router.post('/delete/:id', requireEmployeeOrAdmin(), invCtrl.deleteItem)

module.exports = router
