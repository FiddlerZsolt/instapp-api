import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { winstonMiddleware } from './utils/logger.js';
import createContextMiddleware from './middleware/createContextMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';

import initRoutes from './routes/index.js';
import { NotFoundError } from './utils/errors.js';
import Cacher, { saveCacheMiddleware } from './utils/cacher.js';

// Initialize Express app
const app = express();

// Initialize Cacher
const cacher = new Cacher({
  // debug: true,
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || 'localhost',
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD || 'default',
}).init();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
// Middleware to create context for each request
app.use(
  createContextMiddleware({
    cacheOptions: null,
    cacher: cacher,
    isCache: false,
  })
);
// Middleware to log requests
app.use(winstonMiddleware);
// Middleware to set cache
app.use(saveCacheMiddleware);

initRoutes(app);

// Clear all caches
app.get('/clear-cache', async (req, res) => {
  try {
    await req.context.cacher.del(req.context.params.key);
    res.status(200).json({ message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cache', error });
  }
});

// Handle 404 - Route not found (using our custom error)
app.use((req, res, next) => {
  next(new NotFoundError('The requested resource was not found on this server', 'RESOURCE_NOT_FOUND'));
});

app.use(errorHandler);

export default app;
