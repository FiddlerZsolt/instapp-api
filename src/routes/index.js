import authRoutes from './auth.js';
import deviceRoutes from './devices.js';
import { addRouteGroup, registerEndpoint, routeGroup } from '../utils/utils.js';

function initRoutes(app) {
  // Register routes
  routeGroup(app, '/api', (router) => {
    addRouteGroup(router, authRoutes);
    addRouteGroup(router, deviceRoutes);

    // Healthcheck endpoint
    registerEndpoint(router, 'get', '/healthcheck', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
  });
}

export default initRoutes;
