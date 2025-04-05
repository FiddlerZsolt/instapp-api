'use strict';

import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that creates a unified context object on the request.
 *
 * This middleware:
 * 1. Ensures req.params exists
 * 2. Creates req.allParams by combining route params, query params, and body
 * 3. Creates a comprehensive req.context object containing:
 *    - All parameters unified in one object
 *    - Request metadata (method, path, url, etc.)
 *    - User information (if available)
 *    - Session data (if available)
 *
 * The context object can be used throughout the request lifecycle to access
 * information without needing to check multiple sources.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const createContextMiddleware = (customParams) => {
  return async (req, res, next) => {
    try {
      // Initialize params object
      req.params = req.params || {};

      // Generate a unique ID for the request
      req.id = uuidv4();

      // Combine all parameters into one object
      req.allParams = {
        // Route params
        ...req.params,
        // Query string params
        ...req.query,
        // Form/JSON body
        ...req.body,
      };

      // Create a context object that includes allParams and other useful request info
      req.context = {
        // Unique request ID
        id: req.id,
        // Include all parameters
        params: {
          // Route params
          ...req.params,
          // Query string params
          ...req.query,
          // Form/JSON body
          ...req.body,
        },
        // Request metadata
        request: {
          method: req.method,
          path: req.path,
          url: req.url,
          originalUrl: req.originalUrl,
          timestamp: new Date().toISOString(),
        },
        meta: {
          // User info (will be populated by auth middleware if available)
          user: req.user || null,
          // Device info (if applicable)
          device: req.device || null,
        },
        // Add any other contextual information you want available throughout the request
        ...customParams,
      };

      next();
    } catch (error) {
      logger.error('Error in context middleware:', error);
      next(); // Continue to handler on error}
    }
  };
};

export default createContextMiddleware;
