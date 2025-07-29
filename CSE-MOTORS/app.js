const express = require('express');
const path = require('path');
const app = express();
const utilities = require('./utilities'); // Adicione esta linha para importar utilities

// CONFIGURAÇÕES
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE PARA ARQUIVOS ESTÁTICOS (css, js, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARE PARA RECEBER JSON E FORMULÁRIOS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROTAS
const indexRouter = require('./routes/index');
const inventoryRouter = require('./routes/inventoryRoute');

app.use('/', indexRouter);
app.use('/inv', inventoryRouter);

// MIDDLEWARE PARA ROTAS NÃO ENCONTRADAS (404)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error); // Passa o erro para o próximo middleware
});

// MIDDLEWARE DE TRATAMENTO DE ERROS (deve ser o último)
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (e) {
    console.error('Failed to get navigation:', e);
    nav = []; // Fallback caso haja erro ao obter a navegação
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  const status = err.status || 500;
  res.status(status).render("errors/error", {
    title: status === 404 ? "404 Not Found" : "500 Server Error",
    message: status === 404 ? err.message : "Something went wrong. Please try again later.",
    nav
  });
});

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});