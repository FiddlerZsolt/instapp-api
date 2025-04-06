import express from 'express';
import { NotFoundError } from '../utils/errors.js';

const router = express.Router();

// Handle 404 - Route not found (using our custom error)
router.use((req, res, next) =>
  next(new NotFoundError('The requested resource was not found on this server', 'RESOURCE_NOT_FOUND'))
);

export default router;
