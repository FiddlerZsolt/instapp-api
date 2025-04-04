import express from 'express';
import * as usersController from '../controllers/usersController.js';
import { authorization } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
// router.get('/', usersController.getAllUsers);
// router.get('/:id', usersController.getUserById);

// // Protected routes - require authentication
// router.post('/', authorization, usersController.createUser);
// router.put('/:id', authorization, usersController.updateUser);
// router.delete('/:id', authorization, usersController.deleteUser);

export default router;
