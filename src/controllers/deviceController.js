import crypto from 'crypto';
import { Device } from '../models/index.js';

// Create a new device
export const addDevice = async (req, res) => {
  const { platform, deviceName, token } = req.context.params;

  // Create a new device instance
  const newDevice = await Device.create({
    platform,
    deviceName,
    token,
    apiToken: crypto.randomBytes(16).toString('hex'), // Generate a random API token
  });

  return res.status(201).json({ message: 'Device added successfully', device: newDevice });
};
