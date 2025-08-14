const { body } = require('express-validator')
const { getAccountByEmail } = require('../models/accountModel')

const loginValidator = [
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha obrigatória')
]

const registerValidator = [
  body('firstname').trim().isLength({ min: 2 }).withMessage('Nome muito curto'),
  body('lastname').trim().isLength({ min: 2 }).withMessage('Sobrenome muito curto'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .custom(async value => {
      const exists = await getAccountByEmail(value)
      if (exists) throw new Error('Email já cadastrado')
    }),
  body('password')
    .isLength({ min: 12 }).withMessage('Senha deve ter no mínimo 12 caracteres')
    .matches(/[A-Z]/).withMessage('Senha precisa ter letra maiúscula')
    .matches(/[a-z]/).withMessage('Senha precisa ter letra minúscula')
    .matches(/\d/).withMessage('Senha precisa ter número')
    .matches(/[^A-Za-z0-9]/).withMessage('Senha precisa ter caractere especial')
]

module.exports = { loginValidator, registerValidator }
