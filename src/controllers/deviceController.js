import crypto from 'crypto';
import { Device } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Create a new device
export const addDevice = async (req, res) => {
  try {
    const { platform, deviceName, token } = req.context.params;

    // Create a new device instance
    const newDevice = await Device.create({
      platform,
      deviceName,
      token,
      apiToken: crypto.randomBytes(16).toString('hex'), // Generate a random API token
    });

    return res.status(201).json(
      new ApiResponse({
        token: newDevice.apiToken,
      })
    );
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
