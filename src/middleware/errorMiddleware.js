const { ApiError } = require('../utils/errors');
const { logger } = require('../utils/logger');

/**
 * Global error handler middleware for the Express application
 * Formats and sends appropriate error responses based on error type
 */
function errorHandler(err, req, res, next) {
  // Log the error for debugging purposes
  logger.error(err);

  // Default error status and message
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_ERROR';
  let data = null;

  // Handle our custom API errors
  if (ApiError.isOperational(err)) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.code;
    data = err.data;
  }
  // Handle Sequelize validation errors
  else if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 422;
    message = 'Validation Error';
    errorCode = 'VALIDATION_ERROR';
    data = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // Handle JSON Web Token errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }
  // Handle syntax errors in JSON parsing
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON';
    errorCode = 'INVALID_JSON';
  }

  // Hide sensitive error details in production
  const error = {
    message,
    code: errorCode,
    data,
  };

  // Include stack trace in development only
  // if (process.env.NODE_ENV === 'development') {
  //   error.stack = err.stack;
  // }

  // Send the error response
  res.status(statusCode).json(error);
}

module.exports = errorHandler;
