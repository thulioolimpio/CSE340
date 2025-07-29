// routes/index.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/trigger-error', (req, res) => {
  throw new Error("Erro intencional de servidor.");
});

module.exports = router;
