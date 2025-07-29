const express = require('express');
const path = require('path');
const app = express();

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// 404 Error
app.use(async (req, res) => {
  const nav = await getNav(); // ou um nav fixo
  res.status(404).render("errors/error", {
    title: "404 Not Found",
    message: "Sorry, we couldn't find that page.",
    nav
  });
});

// 500 Error
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  const nav = await getNav();
  res.status(500).render("errors/error", {
    title: "500 Error",
    message: "A server error occurred.",
    nav
  });
});
