const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash'); // Alterado para connect-flash
const app = express();
const utilities = require('./utilities');

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'sua_chave_secreta_segura_aleatoria', // Mude para um valor único
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Secure apenas em produção
    maxAge: 24 * 60 * 60 * 1000 // 1 dia
  }
}));

// Configuração do flash - DEVE vir após a sessão
app.use(flash());

// Middleware para variáveis locais
app.use(async (req, res, next) => {
  // Passar mensagens flash para todas as views
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  };
  
  // Identificar a rota atual
  const path = req.path.split('/')[1] || 'home';
  res.locals.current = path === 'inv' ? 'inv' : path;
  
  // Obter navegação
  res.locals.nav = await utilities.getNav();
  
  next();
});

// Rotas
const indexRouter = require('./routes/index');
const inventoryRouter = require('./routes/inventoryRoute');
app.use('/', indexRouter);
app.use('/inv', inventoryRouter);

// Error Handling
app.use(async (req, res, next) => {
  res.status(404).render("errors/404", {
    title: "404 Not Found",
    message: "The page you requested doesn't exist."
  });
});

app.use(async (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", {
    title: "500 Server Error",
    message: err.message,
    err: process.env.NODE_ENV === 'development' ? err : null
  });
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});