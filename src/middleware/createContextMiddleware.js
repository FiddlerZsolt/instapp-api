'use strict';

import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const createContextMiddleware = (customParams) => {
  return async (req, res, next) => {
    try {
      // Generate a unique ID for the request
      req.id = uuidv4();

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
          // will be populated by auth middleware if available
          user: req.user || null,
          device: req.device || null,
        },
        $action: {
          cacheOptions: null,
          isCache: false,
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
