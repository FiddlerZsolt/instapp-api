import express from 'express';
import cors from 'cors';

import { winstonMiddleware } from './utils/logger.js';
import createContextMiddleware from './middleware/createContextMiddleware.js';
import errorHandler from './middleware/errorMiddleware.js';

import initRoutes from './routes/index.js';
import { NotFoundError } from './utils/errors.js';

// Initialize Express app
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(createContextMiddleware);
app.use(winstonMiddleware);

initRoutes(app);

// // Handle 404 - Route not found (using our custom error)
app.use((req, res, next) => {
  next(new NotFoundError('The requested resource was not found on this server', 'RESOURCE_NOT_FOUND'));
});

app.use(errorHandler);

export default app;
