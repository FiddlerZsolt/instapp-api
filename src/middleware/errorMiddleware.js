import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/errors.js';

/**
 * Global error handler middleware for the Express application
 * Formats and sends appropriate error responses based on error type
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
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

  // Hide sensitive error details in production
  const error = {
    statusCode,
    code: errorCode,
    data,
    message,
  };

  // Send the error response
  res.status(statusCode).json(error);
}
