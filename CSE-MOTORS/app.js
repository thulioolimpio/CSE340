const express = require('express');
const path = require('path');
const app = express();

// CONFIGURAÇÕES
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARE PARA ARQUIVOS ESTÁTICOS (css, js, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// ROTAS
const indexRouter = require('./routes/index');
const inventoryRouter = require('./routes/inventoryRoute'); // se você tiver
app.use('/', indexRouter);
app.use('/inv', inventoryRouter); // exemplo: rota para /inv/detail/:id

// MIDDLEWARE DE ERRO 404 (deve vir após todas as rotas)
app.use((req, res) => {
  res.status(404).render('errors/error', {
    title: '404 - Not Found',
    message: 'Sorry, the page you requested could not be found.',
    nav: '' // se quiser pode incluir getNav()
  });
});

// MIDDLEWARE DE ERRO 500 (deve vir depois do 404)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/error', {
    title: '500 - Server Error',
    message: 'Something went wrong on the server.',
    nav: ''
  });
});

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
