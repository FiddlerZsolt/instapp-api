import chalk from 'chalk';
import express from 'express';

/**
 * Register a new endpoint in Express
 *
 * @param {object} app - Express application instance
 * @param {string} method - HTTP method (get, post, put, delete, etc.)
 * @param {string} path - Endpoint path
 * @param {function} handler - Route handler function
 * @param {Array} middlewares - Optional array of middleware functions
 */
export const registerEndpoint = function (app, method, path, handler, middlewares = []) {
  console.log(chalk.yellowBright(`[${method.toUpperCase()}] ${path}`));
  // Register the endpoint
  if (Array.isArray(middlewares) && middlewares.length > 0) {
    app[method](path, ...middlewares, handler);
  } else {
    app[method](path, handler);
  }
};

/**
 * Create a router group with a prefix
 *
 * @param {object} app - Express application instance
 * @param {string} prefix - Route prefix
 * @param {function} routesCallback - Callback function to define routes
 * @param {Array} middlewares - Optional array of middleware functions for all routes in the group
 */
export const routeGroup = function (app, prefix, routesCallback, middlewares = []) {
  const router = express.Router();

  // Apply group-level middlewares if provided
  if (Array.isArray(middlewares) && middlewares.length > 0) {
    router.use(...middlewares);
  }

  // Call the callback with the router to define routes
  console.log(chalk.greenBright(`REGISTERING ${chalk.yellowBright(prefix)} ROUTES`));
  routesCallback(router);

  // Mount the router at the specified prefix
  app.use(prefix, router);

  return router;
};

/**
 * Register route group with a prefix
 *
 * @param {object} app - Express application instance
 * @param {string} prefix - Route prefix
 * @param {function} routesCallback - Callback function to define routes
 */
export const addRouteGroup = function (router, prefixOrRouter, routerModule) {
  if (typeof prefixOrRouter === 'function' && prefixOrRouter.use && !routerModule) {
    router.use(prefixOrRouter);
    return router;
  }

  if (typeof prefixOrRouter === 'string' && routerModule) {
    router.use(prefixOrRouter, routerModule);
    return router;
  }

  return router;
};
