const express = require('express');
const path = require('path');
const app = express();
const utilities = require('./utilities');

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para definir current page
app.use((req, res, next) => {
  const path = req.path.split('/')[1] || 'home';
  res.locals.current = path === 'inv' ? 'inv' : path;
  next();
});
// Rotas
const indexRouter = require('./routes/index');
const inventoryRouter = require('./routes/inventoryRoute');
app.use('/', indexRouter);
app.use('/inv', inventoryRouter);

// Error Handling (substitua o existente)
app.use(async (req, res, next) => {
  res.status(404).render("errors/404", {
    title: "404 Not Found",
    nav: await utilities.getNav(),
    message: "The page you requested doesn't exist."
  });
});

app.use(async (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/500", {
    title: "500 Server Error",
    nav: await utilities.getNav(),
    message: err.message,
    err: process.env.NODE_ENV === 'development' ? err : null
  });
});
// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});