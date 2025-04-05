import authRoutes from './auth.js';
import deviceRoutes from './devices.js';
import express from 'express';

function initRoutes(app) {
  const apiRouter = express.Router();

  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/devices', deviceRoutes);

  app.use('/api', apiRouter);
}

export default initRoutes;
