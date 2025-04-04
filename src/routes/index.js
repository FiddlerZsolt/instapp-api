'use strict';

const apiRouter = require('express').Router();
const fs = require('fs');
const path = require('path');
const { authorization } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// Function to read and register all service files
function loadServices(servicesPath) {
  servicesPath = servicesPath || path.join(__dirname, '../services');
  if (!fs.existsSync(servicesPath)) {
    console.error(`Services directory not found: ${servicesPath}`);
    return;
  }

  const serviceFiles = fs.readdirSync(servicesPath).filter((file) => file.endsWith('.js') || file.endsWith('.json'));

  console.log(`Loading ${serviceFiles.length} service files...`);

  serviceFiles.forEach((file) => {
    try {
      const servicePath = path.join(servicesPath, file);
      console.log(`Registering routes for service: ${file}`);
      console.log(`Service path: ${servicePath}`);

      // const fileConnect = fs.readFileSync(servicePath, 'utf8');

      const fileConnect = require(servicesPath);

      parseServiceSchema(fileConnect);
    } catch (error) {
      console.error(`Error loading service file ${file}:`, error);
    }
  });
}

function parseServiceSchema(serviceSchema) {
  const { name } = serviceSchema;
  // Register routes into router
  Object.entries(serviceSchema.actions).map(([actionName, actionConfig]) => {
    const { rest, params, handler } = actionConfig;
    console.log(`${rest.method} ${rest.path} => ${actionName}`);
    const middlewares = [];
    if (actionConfig.auth) {
      middlewares.push(authorization);
    }

    const serviceRouter = express.Router();

    serviceRouter[actionConfig.rest.method.toLowerCase()](
      rest.path,
      middlewares || [],
      params ? validate(params) : [],
      handler
    );

    apiRouter.use(`/${name}`, serviceRouter);
  });
}

module.exports = loadServices;
