import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { logger, winstonMiddleware } from './utils/logger.js';

import errorHandler from './middleware/errorMiddleware.js';
import createContextMiddleware from './middleware/createContextMiddleware.js';
import { NotFoundError } from './utils/errors.js';

// Import route files
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import deviceRoutes from './routes/devices.js';
import { addRouteGroup, routeGroup } from './utils/utils.js';

// Load environment variables
dotenv.config();

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_FOLDER = path.resolve(__dirname, '../', 'public');

// Initialize Express app
const app = express();

// CORS middleware
app.use(cors());

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Validate request parameters
app.use(createContextMiddleware);

// Use Morgan for HTTP request logging
app.use(winstonMiddleware);

// Serve static files
app.use(express.static(PUBLIC_FOLDER));

routeGroup(app, '/api', (router) => {
  addRouteGroup(router, authRoutes);
  addRouteGroup(router, deviceRoutes);
});

// app.use('/api/devices', deviceRoutes);
// app.use('/api', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/posts', postRoutes);

// Now you can use Winston logger in your app
app.get('/', (req, res) => {
  logger.info('Home route accessed', { requestId: req.id });
  res.send('Hello World');
});

// Handle 404 - Route not found (using our custom error)
app.use((req, res, next) => {
  next(new NotFoundError('The requested resource was not found on this server', 'RESOURCE_NOT_FOUND'));
});

// Error handling middleware - should be last
app.use(errorHandler);

app.use((err, req, res, next) => {
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
  });
  res.status(500).send('Something broke!');
});

export default app;
