const Validator = require('fastest-validator');
const { ValidationError } = require('../utils/errors');
const v = new Validator();

exports.validate = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      // If no schema is provided, skip validation
      return next();
    }

    try {
      // Check if the schema is valid
      const check = v.compile(schema);

      // Run validation against request parameters
      const validationResult = check(req.context.params);

      // If validation passed, continue to next middleware
      if (validationResult === true) {
        return next();
      }

      // Validation failed, throw a ValidationError
      const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', validationResult);
      next(error);
    } catch (err) {
      // Handle any errors in the validation process itself
      const error = new ValidationError(`Validation error: ${err.message}`);
      next(error);
    }
  };
};
