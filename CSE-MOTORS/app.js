const express = require('express');
const path = require('path');
const app = express();

// CONFIGURAÇÕES
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE PARA ARQUIVOS ESTÁTICOS (css, js, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARE PARA RECEBER JSON E FORMULÁRIOS (se necessário futuramente)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROTAS
const indexRouter = require('./routes/index');
const inventoryRouter = require('./routes/inventoryRoute');

app.use('/', indexRouter);
app.use('/inv', inventoryRouter);

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Error handling middleware (should be after all other middleware and routes)
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  if (err.status === 404) {
    res.status(404).render("errors/error", {
      title: "404 Not Found",
      message: err.message,
      nav
    });
  } else {
    res.status(500).render("errors/error", {
      title: "500 Server Error",
      message: "Something went wrong. Please try again later.",
      nav
    });
  }
});