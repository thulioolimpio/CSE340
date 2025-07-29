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

// 404 Error - para páginas não encontradas
app.use((req, res) => {
  res.status(404).render("errors/error", {
    title: "404 - Not Found",
    message: "Sorry, we couldn't find that page.",
    nav: "" // não precisa de navegação dinâmica
  });
});

// 500 Error - para erros no servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("errors/error", {
    title: "500 - Server Error",
    message: "Something went wrong on the server.",
    nav: "" // não precisa de navegação dinâmica
  });
});

