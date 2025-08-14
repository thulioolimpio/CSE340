const accountModel = require('../models/accountModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateAccountData, validatePassword } = require('../utilities');

const accountController = {
  // Processar login
  processLogin: async function(req, res, next) {
    try {
      const { account_email, account_password } = req.body;
      
      // Validação básica
      if (!account_email || !account_password) {
        req.flash('notice', 'Please provide both email and password');
        return res.status(400).redirect('/account/login');
      }

      // Buscar conta no banco de dados
      const account = await accountModel.getAccountByEmail(account_email.trim());
      
      // Verificar se a conta existe
      if (!account) {
        req.flash('notice', 'Invalid credentials');
        return res.status(401).redirect('/account/login');
      }

      // Verificar senha
      const passwordMatch = await bcrypt.compare(account_password, account.account_password);
      
      if (!passwordMatch) {
        req.flash('notice', 'Invalid credentials');
        return res.status(401).redirect('/account/login');
      }

      // Criar token JWT
      const token = jwt.sign(
        {
          account_id: account.account_id,
          account_type: account.account_type
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Configurar sessão e cookies
      req.session.loggedin = true;
      req.session.accountData = {
        account_id: account.account_id,
        account_firstname: account.account_firstname,
        account_lastname: account.account_lastname,
        account_email: account.account_email,
        account_type: account.account_type
      };
      
      // Configurar cookie HTTP Only seguro
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
        sameSite: 'strict'
      });

      // Redirecionar para página de conta
      res.redirect('/account');

    } catch (error) {
      console.error('Login process error:', error);
      req.flash('notice', 'An error occurred during login');
      res.status(500).redirect('/account/login');
    }
  },

  // Processar logout
  processLogout: function(req, res, next) {
    try {
      // Limpar sessão
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).redirect('/account');
        }
        
        // Limpar cookie JWT
        res.clearCookie('jwt', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Redirecionar para home
        res.redirect('/');
      });
    } catch (error) {
      console.error('Logout process error:', error);
      res.status(500).redirect('/account');
    }
  },

  // Build update view
  buildUpdate: async function (req, res, next) {
    try {
      const account_id = parseInt(req.params.account_id);
      
      if (isNaN(account_id)) {
        req.flash('notice', 'Invalid account ID');
        return res.status(400).redirect('/account');
      }

      if (res.locals.accountData.account_id !== account_id) {
        req.flash('notice', 'Unauthorized access');
        return res.status(403).redirect('/account');
      }

      const accountData = await accountModel.getAccountById(account_id);
      
      if (!accountData) {
        req.flash('notice', 'Account not found');
        return res.status(404).redirect('/account');
      }

      res.render("account/update", {
        title: "Update Account",
        accountData,
        errors: null,
        passwordErrors: null
      });
      
    } catch (error) {
      console.error('Error building update view:', error);
      req.flash('notice', 'Error loading update page');
      next(error);
    }
  },

  // Update account info
  updateAccount: async function (req, res, next) {
    try {
      const { account_id, account_firstname, account_lastname, account_email } = req.body;
      const parsedId = parseInt(account_id);

      if (isNaN(parsedId)) {
        req.flash('notice', 'Invalid account ID');
        return res.status(400).redirect('/account');
      }

      if (res.locals.accountData.account_id !== parsedId) {
        req.flash('notice', 'Unauthorized access');
        return res.status(403).redirect('/account');
      }

      // Validação dos dados
      const errors = validateAccountData(req.body);
      
      if (errors.length > 0) {
        const accountData = await accountModel.getAccountById(parsedId);
        return res.render("account/update", {
          title: "Update Account",
          accountData: { ...accountData, ...req.body },
          errors,
          passwordErrors: null
        });
      }

      // Verificar se o email já está em uso
      const existingAccount = await accountModel.getAccountByEmail(account_email);
      if (existingAccount && existingAccount.account_id !== parsedId) {
        const accountData = await accountModel.getAccountById(parsedId);
        return res.render("account/update", {
          title: "Update Account",
          accountData: { ...accountData, ...req.body },
          errors: ['Email already in use by another account'],
          passwordErrors: null
        });
      }

      // Atualizar conta
      const updateResult = await accountModel.updateAccount(
        parsedId, 
        account_firstname.trim(), 
        account_lastname.trim(), 
        account_email.trim()
      );

      if (!updateResult) {
        throw new Error('Failed to update account');
      }

      // Atualizar dados na sessão
      if (res.locals.accountData.account_id === parsedId) {
        req.session.accountData = {
          ...req.session.accountData,
          account_firstname: account_firstname.trim(),
          account_lastname: account_lastname.trim(),
          account_email: account_email.trim()
        };
      }

      req.flash('success', 'Account updated successfully');
      res.redirect('/account');
      
    } catch (error) {
      console.error('Error updating account:', error);
      req.flash('notice', 'Error updating account');
      res.redirect(`/account/update/${req.body.account_id}`);
    }
  },

  // Update password
  updatePassword: async function (req, res, next) {
    try {
      const { account_id, account_password } = req.body;
      const parsedId = parseInt(account_id);

      if (isNaN(parsedId)) {
        req.flash('notice', 'Invalid account ID');
        return res.status(400).redirect('/account');
      }

      if (res.locals.accountData.account_id !== parsedId) {
        req.flash('notice', 'Unauthorized access');
        return res.status(403).redirect('/account');
      }

      // Validação da senha
      const errors = validatePassword(account_password);
      
      if (errors.length > 0) {
        const accountData = await accountModel.getAccountById(parsedId);
        return res.render("account/update", {
          title: "Update Account",
          accountData,
          errors: null,
          passwordErrors: errors
        });
      }

      // Hash e atualização da senha
      const hashedPassword = await bcrypt.hash(account_password, 10);
      const updateResult = await accountModel.updatePassword(parsedId, hashedPassword);

      if (!updateResult) {
        throw new Error('Failed to update password');
      }

      req.flash('success', 'Password updated successfully');
      res.redirect('/account');
      
    } catch (error) {
      console.error('Error updating password:', error);
      req.flash('notice', 'Error updating password');
      res.redirect(`/account/update/${req.body.account_id}`);
    }
  }
};

module.exports = accountController;