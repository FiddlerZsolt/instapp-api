const crypto = require('crypto');
const { Device } = require('../models');

// Get all devices for a user
exports.getUserDevices = async (req, res) => {
  try {
    const devices = await Device.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'platform', 'deviceName', 'createdAt', 'updatedAt'],
    });

    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single device by ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
      attributes: ['id', 'platform', 'deviceName', 'createdAt', 'updatedAt'],
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new device for a user
exports.addDevice = async (req, res) => {
  try {
    const { platform, deviceName } = req.body;

    if (!platform || !deviceName) {
      return res.status(400).json({
        message: 'Please provide platform and deviceName',
      });
    }

    // Check if device already exists for this user
    const existingDevice = await Device.findOne({
      where: {
        user_id: req.user.id,
        platform,
        deviceName,
      },
    });

    if (existingDevice) {
      return res.status(400).json({
        message: 'Device with this name already exists for your account',
      });
    }

    // Generate token and API token
    const token = req.headers.authorization.split(' ')[1]; // Use the current JWT token
    const apiToken = crypto.randomBytes(32).toString('hex');

    // Create device
    const device = await Device.create({
      platform,
      deviceName,
      token,
      apiToken,
      user_id: req.user.id,
    });

    res.status(201).json({
      id: device.id,
      platform: device.platform,
      deviceName: device.deviceName,
      apiToken: device.apiToken,
      createdAt: device.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a device
exports.removeDevice = async (req, res) => {
  try {
    const device = await Device.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    await device.destroy();
    res.json({ message: 'Device removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Refresh API token for a device
exports.refreshDeviceToken = async (req, res) => {
  try {
    const device = await Device.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    // Generate new API token
    const apiToken = crypto.randomBytes(32).toString('hex');

    // Update device with new token
    await device.update({ apiToken });

    res.json({
      id: device.id,
      platform: device.platform,
      deviceName: device.deviceName,
      apiToken: device.apiToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
