import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post(
  '/',
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
  deviceController.addDevice
);

export default router;
