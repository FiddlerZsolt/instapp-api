import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { authorization } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected by the auth middleware
router.use(authorization);

// Get all devices for the logged-in user
router.get('/', deviceController.getUserDevices);

// Get a single device by ID
router.get('/:id', deviceController.getDeviceById);

// Add a new device
router.post('/', deviceController.addDevice);

// Remove a device
router.delete('/:id', deviceController.removeDevice);

// Refresh a device's API token
router.post('/:id/refresh-token', deviceController.refreshDeviceToken);

export default router;
