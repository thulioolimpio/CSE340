const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { signToken, TOKEN_NAME } = require('../utils/jwt');
const Account = require('../models/accountModel');

/**
 * GET /account/login
 * Exibe a view de login
 */
function buildLoginView(req, res) {
  return res.render('account/login', {
    title: 'Login',
    errors: null,
    messages: req.flash('notice'),
    formData: null
  });
}

/**
 * GET /account/register
 * Exibe a view de registro
 */
function buildRegisterView(req, res) {
  return res.render('account/register', {
    title: 'Registrar',
    errors: null,
    messages: req.flash('notice'),
    formData: null
  });
}

/**
 * POST /account/login
 * Processa o login do usuário
 */
async function loginUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('account/login', {
        title: 'Login',
        errors: errors.array(),
        messages: req.flash('notice'),
        formData: req.body
      });
    }

    const { email, password } = req.body;
    const account = await Account.getAccountByEmail(email);
    
    if (!account) {
      req.flash('notice', 'Usuário ou senha inválidos.');
      return res.redirect('/account/login');
    }

    const match = await bcrypt.compare(password, account.account_password);
    if (!match) {
      req.flash('notice', 'Usuário ou senha inválidos.');
      return res.redirect('/account/login');
    }

    const token = signToken({
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_email: account.account_email,
      account_type: account.account_type,
    });

    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    });

    req.flash('notice', 'Login realizado com sucesso!');
    return res.redirect('/account/management');
  } catch (err) {
    console.error('Erro no login:', err);
    req.flash('notice', 'Ocorreu um erro ao efetuar login.');
    return res.redirect('/account/login');
  }
}

/**
 * POST /account/register
 * Processa o registro de novo usuário
 */
async function registerUser(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('account/register', {
        title: 'Registrar',
        errors: errors.array(),
        messages: req.flash('notice'),
        formData: req.body
      });
    }

    const { firstname, lastname, email, password } = req.body;
    
    // Verificação adicional da senha
    if (!password || typeof password !== 'string') {
      return res.status(400).render('account/register', {
        title: 'Registrar',
        errors: [{ msg: 'A senha fornecida é inválida' }],
        messages: req.flash('notice'),
        formData: req.body
      });
    }

    // Verifica se email já existe
    const existingAccount = await Account.getAccountByEmail(email);
    if (existingAccount) {
      req.flash('notice', 'Este email já está cadastrado.');
      return res.redirect('/account/register');
    }

    // Geração do hash
    const hash = await bcrypt.hash(password, 12);

    // Criação da conta
    await Account.createAccount({
      account_firstname: firstname,
      account_lastname: lastname,
      account_email: email,
      account_password: hash,
      account_type: 'Client'
    });

    req.flash('notice', 'Conta criada com sucesso! Faça login.');
    return res.redirect('/account/login');
  } catch (err) {
    console.error('Erro no registro:', err);
    
    // Tratamento específico para erro de duplicação de email
    if (err.code === '23505') {
      req.flash('notice', 'Este email já está cadastrado.');
      return res.redirect('/account/register');
    }

    req.flash('notice', 'Não foi possível criar sua conta.');
    return res.redirect('/account/register');
  }
}

/**
 * GET /account/management
 * Exibe a view de gerenciamento da conta
 */
async function buildManagement(req, res) {
  try {
    const user = req.user; // Definido pelo middleware de autenticação
    const account = await Account.getAccountById(user.account_id);
    
    if (!account) {
      req.flash('notice', 'Conta não encontrada.');
      return res.redirect('/');
    }

    const title = 'Minha Conta';
    return res.render('account/management', { 
      title, 
      account,
      messages: req.flash('notice')
    });
  } catch (err) {
    console.error('Erro ao montar management:', err);
    req.flash('notice', 'Não foi possível carregar sua conta.');
    return res.redirect('/');
  }
}

/**
 * GET /account/update/:id
 * Exibe a view de atualização da conta
 */
async function buildUpdateView(req, res) {
  try {
    const { id } = req.params;
    
    // Verifica se o usuário tem permissão
    if (Number(req.user.account_id) !== Number(id)) {
      req.flash('notice', 'Acesso negado.');
      return res.redirect('/account/management');
    }

    const account = await Account.getAccountById(id);
    if (!account) {
      req.flash('notice', 'Conta não encontrada.');
      return res.redirect('/account/management');
    }

    const title = 'Atualizar Conta';
    return res.render('account/update', {
      title,
      account,
      errors: null,
      messages: req.flash('notice')
    });
  } catch (err) {
    console.error('Erro ao montar update view:', err);
    req.flash('notice', 'Não foi possível abrir o formulário de atualização.');
    return res.redirect('/account/management');
  }
}

/**
 * POST /account/update
 * Processa a atualização das informações da conta
 */
async function updateAccountInfo(req, res) {
  try {
    const errors = validationResult(req);
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    
    // Verifica se o usuário tem permissão
    if (Number(req.user.account_id) !== Number(account_id)) {
      req.flash('notice', 'Acesso negado.');
      return res.redirect('/account/management');
    }

    const stickyAccount = { 
      account_id, 
      account_firstname, 
      account_lastname, 
      account_email 
    };

    if (!errors.isEmpty()) {
      const title = 'Atualizar Conta';
      return res.status(400).render('account/update', {
        title,
        account: stickyAccount,
        errors: errors.array(),
        messages: req.flash('notice')
      });
    }

    // Verifica se o email já existe (para outro usuário)
    const existingAccount = await Account.getAccountByEmail(account_email);
    if (existingAccount && existingAccount.account_id != account_id) {
      return res.status(400).render('account/update', {
        title: 'Atualizar Conta',
        account: stickyAccount,
        errors: [{ msg: 'Este email já está em uso por outra conta' }],
        messages: req.flash('notice')
      });
    }

    // Atualiza os dados
    const result = await Account.updateAccountInfo({
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });

    if (!result.success) {
      req.flash('notice', 'Não foi possível atualizar seus dados. Tente novamente.');
      return res.status(500).render('account/update', {
        title: 'Atualizar Conta',
        account: stickyAccount,
        errors: null,
        messages: req.flash('notice')
      });
    }

    // Atualiza o token JWT com os novos dados
    const updatedAccount = await Account.getAccountById(account_id);
    const token = signToken({
      account_id: updatedAccount.account_id,
      account_firstname: updatedAccount.account_firstname,
      account_email: updatedAccount.account_email,
      account_type: updatedAccount.account_type,
    });

    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    req.flash('notice', 'Dados atualizados com sucesso.');
    return res.redirect('/account/management');
  } catch (err) {
    console.error('Erro ao atualizar conta:', err);
    req.flash('notice', 'Erro inesperado ao atualizar seus dados.');
    return res.redirect('/account/management');
  }
}

/**
 * POST /account/change-password
 * Processa a alteração de senha
 */
async function changePassword(req, res) {
  try {
    const errors = validationResult(req);
    const { account_id, account_password } = req.body;
    
    // Verifica se o usuário tem permissão
    if (Number(req.user.account_id) !== Number(account_id)) {
      req.flash('notice', 'Acesso negado.');
      return res.redirect('/account/management');
    }

    if (!errors.isEmpty()) {
      const account = await Account.getAccountById(account_id);
      const title = 'Atualizar Conta';
      req.flash('notice', 'Corrija os erros de senha.');
      return res.status(400).render('account/update', {
        title,
        account,
        errors: errors.array(),
        messages: req.flash('notice')
      });
    }

    // Gera o novo hash da senha
    const password_hash = await bcrypt.hash(account_password, 12);
    const result = await Account.updatePassword({ account_id, password_hash });

    if (!result.success) {
      req.flash('notice', 'Não foi possível alterar a senha. Tente novamente.');
      return res.redirect('/account/update/' + account_id);
    }

    req.flash('notice', 'Senha alterada com sucesso.');
    return res.redirect('/account/management');
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    req.flash('notice', 'Erro inesperado ao alterar a senha.');
    return res.redirect('/account/management');
  }
}

/**
 * GET /account/logout
 * Processa o logout do usuário
 */
function logout(req, res) {
  try {
    res.clearCookie(TOKEN_NAME);
    req.flash('notice', 'Logout realizado com sucesso.');
    return res.redirect('/');
  } catch (err) {
    console.error('Erro no logout:', err);
    req.flash('notice', 'Ocorreu um erro ao fazer logout.');
    return res.redirect('/');
  }
}

module.exports = {
  // Views
  buildLoginView,
  buildRegisterView,
  buildManagement,
  buildUpdateView,
  
  // Actions
  loginUser,
  registerUser,
  updateAccountInfo,
  changePassword,
  logout,
};