import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { registerEndpoint, routeGroup } from '../utils/utils.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

routeGroup(router, '/devices', (router) => {
  registerEndpoint(router, 'post', '/', deviceController.addDevice, [
    validate({
      platform: {
        type: 'enum',
        empty: false,
        values: ['android', 'ios'],
      },
      deviceName: {
        type: 'string',
        empty: false,
      },
      token: {
        type: 'string',
        empty: false,
      },
    }),
  ]);
});

export default router;
