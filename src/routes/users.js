const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authorization } = require('../middleware/authMiddleware');

// Public routes
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

// Protected routes - require authentication
router.post('/', authorization, usersController.createUser);
router.put('/:id', authorization, usersController.updateUser);
router.delete('/:id', authorization, usersController.deleteUser);

module.exports = router;
