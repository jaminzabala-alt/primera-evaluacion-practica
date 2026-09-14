function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
}

function errorHandler(error, req, res, next) {
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    'body' in error
  ) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido',
    });
  }

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 600
      ? error.statusCode
      : 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? 'Error interno del servidor'
        : error.message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};