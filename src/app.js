import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import timeout from 'connect-timeout';
import compression from 'compression';

import createContextMiddleware from './middleware/createContextMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';
import requestLoggerMiddleware from './middleware/requestLoggerMiddleware.js';
import notFoundHandler from './routes/notFound.js';

import initRoutes from './routes/index.js';
import Cacher, { cacheMiddleware } from './utils/cacher.js';
import { REDIS_CONFIG, SERVER_CONFIGURATION } from './constants.js';

// Initialize Express app
const app = express();

// Initialize Cacher
const cacher = new Cacher({
  // debug: true,
  prefix: 'INSTAPP',
  port: REDIS_CONFIG.PORT,
  host: REDIS_CONFIG.HOST,
  username: REDIS_CONFIG.USERNAME,
  password: REDIS_CONFIG.PASSWORD,
}).init();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to set security headers
app.use(timeout('30s'));
app.use(limiter);
app.use(
  cors({
    origin: SERVER_CONFIGURATION.CORS.ALLOWED_ORIGINS,
    credentials: SERVER_CONFIGURATION.CORS.CREDENTIALS,
  })
);
app.use(helmet());
app.use(compression());
// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
// Middleware to create context for each request
app.use(createContextMiddleware({ cacher }));
// Middleware to log requests
app.use(requestLoggerMiddleware);
// Middleware to set cache
app.use(cacheMiddleware);

// Handle timeouts properly
app.use((req, res, next) => {
  if (!req.timedout) next();
});

initRoutes(app);

// Handle 404 - Route not found (using our custom error)
app.use(notFoundHandler);

// Middleware to handle errors
app.use(errorHandler);

export default app;
