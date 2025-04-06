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
}

export default initRoutes;
