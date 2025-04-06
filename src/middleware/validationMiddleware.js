import Validator from 'fastest-validator';
import { ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const v = new Validator();

/**
 * Middleware to validate request parameters using fastest-validator
 *
 * @param {Object} schema - The validation schema, see fastest-validator documentation for details
 * @returns {Function} - Middleware function
 *
 * @example
 * // Example usage in an Express route
 * router.post(
 *   '/register',
 *   validate({
 *     name: { type: 'string', optional: true },
 *     username: { type: 'string', empty: false },
 *     email: { type: 'email', empty: false },
 *     password: { type: 'string', empty: false, min: 6 },
 *     confirmPassword: { type: 'equal', field: 'password' },
 *     platform: { type: 'enum', values: ['android', 'ios'] },
 *     deviceName: { type: 'string', empty: false },
 *   }),
 *   authController.register
 * );
 */
export const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      // If no schema is provided, skip validation
      return next();
    }

    try {
      // TODO: Cache schemas for better performance
      // Check if the schema is valid
      const check = v.compile(schema);

      // Run validation against request parameters
      const validationResult = check(req.context.params);

      // If validation passed, continue to next middleware
      if (validationResult === true) {
        return next();
      }

      // Validation failed, throw a ValidationError
      throw new ValidationError(validationResult);
    } catch (error) {
      const isValidationError = error instanceof ValidationError;
      if (!isValidationError) {
        logger.error('Error in Validation middleware:', error);
      }
      next(error);
    }
  };
};
