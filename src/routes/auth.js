'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authorization } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

// const serviceSchema = {
//   name: 'auth',
//   actions: {
//     register: {
//       rest: {
//         method: 'POST',
//         path: '/register',
//       },
//       params: {
//         name: { type: 'string', optional: true },
//         username: { type: 'string', empty: false },
//         email: { type: 'email', empty: false },
//         password: { type: 'string', empty: false, min: 6 },
//         confirmPassword: { type: 'equal', field: 'password' },
//         platform: { type: 'enum', values: ['android', 'ios'] },
//         deviceName: { type: 'string', empty: false },
//       },
//       handler: authController.register,
//     },
//     login: {
//       rest: {
//         method: 'POST',
//         path: '/login',
//       },
//       params: {
//         email: { type: 'email', empty: false },
//         password: { type: 'string', empty: false },
//       },
//       handler: authController.login,
//     },
//     me: {
//       rest: {
//         method: 'GET',
//         path: '/me',
//       },
//       auth: true,
//       handler: authController.getCurrentUser,
//     },
//   },
// };

/**
 * Parse the service schema and register routes
 * @param {Object} serviceSchema - The service schema object
 * @returns {void}
 */
// function parseServiceSchema(serviceSchema) {
//   const { name } = serviceSchema;
//   // Register routes into router
//   Object.entries(serviceSchema.actions).map(([actionName, actionConfig]) => {
//     const { rest, params, handler } = actionConfig;
//     console.log(`${rest.method} ${rest.path} => ${actionName}`);
//     const middlewares = [];
//     if (actionConfig.auth) {
//       middlewares.push(authorization);
//     }

//     const router = express.Router();

//     router[actionConfig.rest.method.toLowerCase()](rest.path, middlewares || [], validate(params), handler);

//     apiRouter.use(`/${name}`, router);
//   });
// }

// parseServiceSchema(serviceSchema);

router.post(
  '/register',
  validate({
    name: { type: 'string', optional: true },
    username: { type: 'string', empty: false },
    email: { type: 'email', empty: false },
    password: { type: 'string', empty: false, min: 6 },
    confirmPassword: { type: 'equal', field: 'password' },
    platform: { type: 'enum', values: ['android', 'ios'] },
    deviceName: { type: 'string', empty: false },
  }),
  authController.register
);
router.post(
  '/login',
  validate({
    email: { type: 'email', empty: false },
    password: { type: 'string', empty: false },
  }),
  authController.login
);
router.get('/me', authorization, authController.getCurrentUser);

// TODO: Uncomment the following routes when implemented
// router.get('/logout', authorization, authController.logout);
// router.get('/refresh', authorization, authController.refreshToken);
// router.get('/verify/:token', authController.verifyEmail);
// router.get('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', validate(serviceSchema.actions.resetPassword.params), authController.resetPassword);
// router.get('/verify/:token', authController.verifyEmail);

module.exports = router;
