import app from './src/app.js';
import http from 'http';
import { sequelize } from './src/models/index.js';

// Get port from environment and store in Express
const port = process.env.PORT || 3000;
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Start the server
async function startServer() {
  try {
    // Sync database (in production you might want to remove the { force: true } option)
    await sequelize.sync({ force: false });
    console.info('Database synchronized successfully.');

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Event listener for HTTP server "error" event
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
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
  console.log('Server listening on ' + bind);
}

// Handle application shutdown gracefully
async function shutdown() {
  server.close(async () => {
    try {
      await sequelize.close();
      console.log('Database connection closed.');
      process.exit(0);
    } catch (error) {
      console.error('Error closing database connection:', error);
      process.exit(1);
    }
  });

  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Shutdown timed out, forcefully exiting process');
    process.exit(1);
  }, 10000);
}

// Listen for termination signals
process.on('SIGTERM', () => shutdown());
process.on('SIGINT', () => shutdown());

startServer();
