'use strict';

import express from 'express';
import * as authController from '../controllers/authController.js';
import { authorization } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerEndpoint, routeGroup } from '../utils/utils.js';

const router = express.Router();

routeGroup(router, '/auth', (router) => {
  registerEndpoint(router, 'post', '/register', authController.register, [
    validate({
      name: { type: 'string', optional: true },
      username: { type: 'string', empty: false },
      email: { type: 'email', empty: false },
      password: { type: 'string', empty: false, min: 6 },
      confirmPassword: { type: 'equal', field: 'password' },
      platform: { type: 'enum', values: ['android', 'ios'] },
      deviceName: { type: 'string', empty: false },
    }),
  ]);

  registerEndpoint(router, 'post', '/login', authController.login, [
    validate({
      email: { type: 'email', empty: false },
      password: { type: 'string', empty: false },
    }),
  ]);

  registerEndpoint(router, 'get', '/me', authController.getCurrentUser, [authorization]);
});

// TODO: Uncomment the following routes when implemented
// router.get('/logout', authorization, authController.logout);
// router.get('/refresh', authorization, authController.refreshToken);
// router.get('/verify/:token', authController.verifyEmail);
// router.get('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', validate(serviceSchema.actions.resetPassword.params), authController.resetPassword);
// router.get('/verify/:token', authController.verifyEmail);

export default router;
