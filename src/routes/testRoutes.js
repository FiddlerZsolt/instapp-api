/**
 * Create routes for testing purposes
 */
'use strict';

import express from 'express';
import { validate } from '../middleware/validationMiddleware.js';

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
  async (req, res) => {
    try {
      await req.context.cacher.del(req.context.params.keys);
      res.status(200).json({ message: 'Cache cleared successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error clearing cache', error });
    }
  }
);

// Clear specific cache
router.get(
  '/clear-cache/:key',
  validate({
    key: {
      type: 'string',
      empty: false,
    },
  }),
  async (req, res) => {
    try {
      await req.context.cacher.del(req.context.params.key);
      res.status(200).json({ message: `Cache for key ${req.context.params.key} cleared successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Error clearing cache', error });
    }
  }
);

export default router;
