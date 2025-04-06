/**
 * Create routes for testing purposes
 */
'use strict';

import express from 'express';
import { validate } from '../middleware/validationMiddleware.js';
import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/response.js';

const router = express.Router();

// Clear all caches
router.get(
  '/clear-cache',
  validate({
    keys: {
      type: 'array',
      min: 1,
      items: {
        type: 'string',
      },
    },
  }),
  async (req, res, next) => {
    try {
      await req.context.cacher.del(req.context.params.keys);
      ApiResponse.success(res, {
        message: 'Cache cleared successfully',
      });
    } catch (error) {
      logger.error('Error clearing cache', error);
      next(error);
    }
  }
);

export default router;
