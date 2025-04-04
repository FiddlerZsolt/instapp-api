/**
 * Register a new endpoint in Express
 *
 * @param {object} app - Express application instance
 * @param {string} method - HTTP method (get, post, put, delete, etc.)
 * @param {string} path - Endpoint path
 * @param {function} handler - Route handler function
 * @param {Array} middlewares - Optional array of middleware functions
 */
export const registerEndpoint = (app, method, path, handler, middlewares = []) => {
  // Log the path to the console
  console.log(`Registering endpoint: [${method.toUpperCase()}] ${path}`);

  // Register the endpoint
  if (Array.isArray(middlewares) && middlewares.length > 0) {
    app[method](path, ...middlewares, handler);
  } else {
    app[method](path, handler);
  }
};
