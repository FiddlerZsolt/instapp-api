import crypto from 'crypto';
import { Device } from '../models/index.js';
import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Create a new device
export const addDevice = async (req, res, next) => {
  try {
    const { platform, deviceName, token } = req.context.params;

    // Create a new device instance
    const newDevice = await Device.create({
      platform,
      deviceName,
      token,
      apiToken: crypto.randomBytes(16).toString('hex'), // Generate a random API token
    });

    return ApiResponse.created(res, {
      token: newDevice.apiToken,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
