const jwt = require('jsonwebtoken');
const { User, Device } = require('../models');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// JWT secret key - in a real app, this would be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.authorization = async (req, res, next) => {
  try {
    let token;

    // Check for JWT token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database without password
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw new UnauthorizedError('Not authorized, user not found', 'USER_NOT_FOUND');
      }

      // Add user to request object
      req.user = user;
      return next();
    }

    // Check for API token in X-API-Token header
    if (req.headers['x-api-token']) {
      const apiToken = req.headers['x-api-token'];

      // Find device with the API token
      const device = await Device.findOne({
        where: { apiToken },
        include: [
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] },
          },
        ],
      });

      if (!device || !device.user) {
        throw new UnauthorizedError('Not authorized, invalid API token', 'INVALID_API_TOKEN');
      }

      // Add user and device to request object
      req.user = device.user;
      req.device = device;
      return next();
    }

    // If no token was found
    throw new UnauthorizedError('Not authorized, no token', 'NO_TOKEN');
  } catch (error) {
    // If error is already one of our custom errors, pass it along
    if (error.statusCode) {
      return next(error);
    }

    // Convert JWT errors to our custom error format
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Not authorized, invalid token', 'INVALID_TOKEN'));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Not authorized, token expired', 'TOKEN_EXPIRED'));
    }

    // Pass any other errors to the error handler
    return next(error);
  }
};

// Middleware to check if user has specific roles
exports.hasRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated', 'NOT_AUTHENTICATED'));
    }

    if (roles.length === 0) {
      return next();
    }

    // Assuming user object has a 'role' property
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Not authorized to access this resource', 'INSUFFICIENT_PERMISSIONS'));
    }

    next();
  };
};
