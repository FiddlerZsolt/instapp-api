import { NotFoundError } from '../utils/errors.js';
import authRoutes from './auth.js';
import deviceRoutes from './devices.js';
import testRoutes from './testRoutes.js';
import express from 'express';

function initRoutes(app) {
  const apiRouter = express.Router();

  if (process.env.NODE_ENV === 'development') {
    apiRouter.use('/', testRoutes);
  }
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/devices', deviceRoutes);

  // healthcheck
  apiRouter.get('/healthcheck', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', apiRouter);

  // Handle 404 - Route not found (using our custom error)
  app.use((req, res) => {
    res
      .status(404)
      .json(new NotFoundError('The requested resource was not found on this server', 'RESOURCE_NOT_FOUND'));
  });
}

export default initRoutes;
