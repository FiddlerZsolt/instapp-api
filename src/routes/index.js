import { NotFoundError } from '../utils/errors.js';
import { ApiResponse } from '../utils/response.js';
import authRoutes from './auth.js';
import deviceRoutes from './devices.js';
import testRoutes from './testRoutes.js';
import express from 'express';

function initRoutes(app) {
  const apiRouter = express.Router();

  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/devices', deviceRoutes);

  if (process.env.NODE_ENV === 'development') {
    apiRouter.use('/', testRoutes);
  }

  // healthcheck
  apiRouter.get('/healthcheck', (req, res) =>
    ApiResponse.success(res, {
      status: 'ok',
      message: 'API is running',
    })
  );

  app.use('/api', apiRouter);

  // Handle 404 - Route not found (using our custom error)
  app.use((req, res, next) =>
    next(new NotFoundError('The requested resource was not found on this server', 'RESOURCE_NOT_FOUND'))
  );
}

export default initRoutes;
