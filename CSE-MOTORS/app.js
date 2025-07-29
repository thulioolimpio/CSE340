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

// 404 NOT FOUND HANDLER
app.use((req, res, next) => {
  res.status(404).render('errors/error', {
    title: 'Página não encontrada',
    message: 'Desculpe, a página que você está procurando não foi encontrada.'
  });
});

// 500 ERROR HANDLER (erro do servidor)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/error', {
    title: 'Erro Interno do Servidor',
    message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
  });
});

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
