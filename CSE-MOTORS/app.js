const express = require('express');
const routes = require('./routes');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
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
// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 dia
  }
}));

// Middleware para passar mensagens para as views
app.use((req, res, next) => {
  // Transferir mensagem da sessão para locals
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }
  next();
});
// Configuração do flash
app.use(flash());

// Middleware para garantir persistência de mensagens
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Middleware para variáveis locais
app.use(async (req, res, next) => {
  // Passar todas as mensagens flash
  res.locals.messages = req.flash();
  
  // Identificar a rota atual
  res.locals.current = req.path.split('/')[1] || 'home';
  
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
app.use((req, res, next) => {
  res.status(404).render("errors/404", {
    title: "404 Not Found",
    message: "The page you requested doesn't exist."
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", {
    title: "500 Server Error",
    message: err.message,
    err: process.env.NODE_ENV === 'development' ? err : null
  });
});


  
  // Configurações do app...
  app.set('view engine', 'ejs');
  app.use(express.static('public'));

  // Rotas
  app.use('/', routes);

  // Error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

