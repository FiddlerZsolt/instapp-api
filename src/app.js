import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { winstonMiddleware } from './utils/logger.js';
import createContextMiddleware from './middleware/createContextMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';

import initRoutes from './routes/index.js';
import Cacher, { cacheMiddleware } from './utils/cacher.js';

// Initialize Express app
const app = express();

// Initialize Cacher
const cacher = new Cacher({
  // debug: true,
  prefix: 'INSTAPP',
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
app.use(createContextMiddleware({ cacher }));
// Middleware to log requests
app.use(winstonMiddleware);
// Middleware to set cache
app.use(cacheMiddleware);

initRoutes(app);

app.use(errorHandler);

export default app;
