import authRoutes from './auth.js';
import deviceRoutes from './devices.js';
import express from 'express';

function initRoutes(app) {
  const apiRouter = express.Router();

  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/devices', deviceRoutes);

  // healthcheck
  apiRouter.get('/healthcheck', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api', apiRouter);
}

export default initRoutes;
