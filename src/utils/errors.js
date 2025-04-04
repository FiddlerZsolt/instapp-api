/**
 * Base API Error class that extends Error
 * All custom API errors will extend this class
 */
class ApiError extends Error {
  constructor(message, statusCode, code, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.data = data;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static isOperational(error) {
    return error instanceof ApiError;
  }
}

/**
 * 400 Bad Request Error
 * Use when client sends invalid data
 */
class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST', data = null) {
    super(message, 400, code, data);
  }
}

/**
 * 401 Unauthorized Error
 * Use when authentication is required but failed or not provided
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED', data = null) {
    super(message, 401, code, data);
  }
}

/**
 * 403 Forbidden Error
 * Use when client doesn't have permission to access a resource
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN', data = null) {
    super(message, 403, code, data);
  }
}

/**
 * 404 Not Found Error
 * Use when requested resource doesn't exist
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', code = 'NOT_FOUND', data = null) {
    super(message, 404, code, data);
  }
}

/**
 * 409 Conflict Error
 * Use when request conflicts with current state of server
 */
class ConflictError extends ApiError {
  constructor(message = 'Conflict', code = 'CONFLICT', data = null) {
    super(message, 409, code, data);
  }
}

/**
 * 422 Validation Error
 * Use when validation fails
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed', code = 'VALIDATION_ERROR', data = null) {
    super(message, 422, code, data);
  }
}

/**
 * 429 Too Many Requests Error
 * Use for rate limiting
 */
class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED', data = null) {
    super(message, 429, code, data);
  }
}

/**
 * 500 Internal Server Error
 * Use for unexpected server errors
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', code = 'INTERNAL_ERROR', data = null) {
    super(message, 500, code, data);
  }
}

/**
 * 503 Service Unavailable Error
 * Use when service is temporarily unavailable
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE', data = null) {
    super(message, 503, code, data);
  }
}

export {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
};
