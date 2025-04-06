import app from './src/app.js';
import http from 'http';
import { sequelize } from './src/models/index.js';
import { logger } from './src/utils/logger.js';
import chalk from 'chalk';
import { SERVER_CONFIGURATION } from './src/constants.js';

// Get port from environment and store in Express
app.set('port', SERVER_CONFIGURATION.PORT);

// Create HTTP server
const server = http.createServer(app);

// Start the server
async function startServer() {
  try {
    // Sync database (in production you might want to remove the { force: true } option)
    await sequelize.sync({ force: false });
    logger.info(`${chalk.blue('Database')} synchronized successfully`);

    server.listen(SERVER_CONFIGURATION.PORT);
    server.on('error', onError);
    server.on('listening', onListening);
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
}

// Event listener for HTTP server "error" event
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${SERVER_CONFIGURATION.PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`Port ${SERVER_CONFIGURATION.PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'http://localhost:' + addr.port;
  logger.info(`${chalk.yellow('Server')} listening on ${bind}`);
}

// Handle application shutdown gracefully
async function stopServer() {
  server.close(async () => {
    logger.info('Shutting down server...');
    try {
      await sequelize.close();
      logger.info('Database connection closed.');
      logger.info('Bye bye!');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing database connection:', error);
      process.exit(1);
    }
  });
}

// Listen for termination signals
process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);

startServer();
