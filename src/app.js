const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { logger, winstonMiddleware } = require('./utils/logger');

const errorHandler = require('./middleware/errorMiddleware');
const createContextMiddleware = require('./middleware/createContextMiddleware');
const { NotFoundError } = require('./utils/errors');

// Load environment variables
dotenv.config();

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

// Import and use route files
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/devices', require('./routes/devices'));

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

module.exports = app;
