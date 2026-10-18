function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido'
    });
  }

  const statusCode = Number(err.statusCode) || 500;
  const message =
    statusCode === 500
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = {
  createHttpError,
  errorMiddleware
};
