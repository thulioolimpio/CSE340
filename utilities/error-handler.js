async function errorHandler(err, req, res, next) {
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  let stack = process.env.NODE_ENV === 'development' ? err.stack : '';

  console.error(`Error occurred: ${message}`);
  console.error(err.stack);

  res.status(statusCode);
  res.render('errors/error', {
    title: `${statusCode} Error`,
    message,
    stack,
    nav: await utilities.getNav()
  });
}

module.exports = errorHandler;