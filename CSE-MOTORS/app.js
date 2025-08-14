require('dotenv').config(); // Garantir que as variáveis do .env sejam carregadas
const express = require('express');
const routes = require('./routes');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const { attachUser } = require('./src/middleware/auth');
const utilities = require('./utilities');

const app = express();

// === Configurações ===
app.set('view engine', 'ejs');
// Agora o Express procura em duas pastas diferentes
app.set('views', [
  path.join(__dirname, 'views'),
  path.join(__dirname, 'src', 'views','partials')
]);

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Middleware para mensagens na sessão
app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message;
    delete req.session.message;
  }
  next();
});

// Configuração do flash
app.use(flash());

// Persistência das mensagens
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Variáveis locais padrão
app.use(async (req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.current = req.path.split('/')[1] || 'home';
  res.locals.nav = await utilities.getNav();
  next();
});

// Adiciona user do JWT
app.use(attachUser);

// Disponibiliza usuário logado nas views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// === Rotas ===
const indexRouter = require('./routes/index');
const inventoryRouter = require('./routes/inventoryRoute');
const accountRouter = require('./src/routes/accountRoutes');

app.use('/', indexRouter);
app.use('/inv', inventoryRouter);
app.use('/account', accountRouter);

// === Tratamento de erros ===
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

// Removido o trecho duplicado que sobrescrevia configurações
// para evitar conflitos de rotas e view engine

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
