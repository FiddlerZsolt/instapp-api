import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Device } from '../models/index.js';

// JWT secret key - in a real app, this would be in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register a new user
export const register = async (req, res) => {
  const { name, username, email, password, platform, deviceName } = req.context.params;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({
      message: 'Please provide username, email and password',
    });
  }

  if (!platform || !deviceName) {
    return res.status(400).json({
      message: 'Please provide platform and deviceName',
    });
  }

  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    return res.status(400).json({
      message: 'User with this email already exists',
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    name: name || username, // Using username as name if not provided
    profile_image: '', // Default empty profile image
  });

  // Create JWT token for authentication
  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, {
    expiresIn: '30d',
  });

  // Generate API token for the device
  const apiToken = crypto.randomBytes(32).toString('hex');

  // Create device record
  const device = await Device.create({
    platform,
    deviceName,
    token: token,
    apiToken: apiToken,
    user_id: user.id,
  });

  // Return user info, token and device info
  const userResponse = user.toJSON();
  delete userResponse.password;

  res.status(201).json({
    user: userResponse,
    token,
    device: {
      id: device.id,
      platform: device.platform,
      deviceName: device.deviceName,
      apiToken: device.apiToken,
    },
  });
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password, platform, deviceName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Create token
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, {
      expiresIn: '30d',
    });

    let device;

    // If platform and deviceName are provided, create or update device
    if (platform && deviceName) {
      // Check if device already exists for this user
      device = await Device.findOne({
        where: {
          user_id: user.id,
          platform,
          deviceName,
        },
      });

      if (device) {
        // Update existing device with new token
        await device.update({
          token: token,
        });
      } else {
        // Generate API token for the new device
        const apiToken = crypto.randomBytes(32).toString('hex');

        // Create new device record
        device = await Device.create({
          platform,
          deviceName,
          token: token,
          apiToken: apiToken,
          user_id: user.id,
        });
      }
    }

    // Return user info, token and device info if available
    const userResponse = user.toJSON();
    delete userResponse.password;

    const response = {
      user: userResponse,
      token,
    };

    if (device) {
      response.device = {
        id: device.id,
        platform: device.platform,
        deviceName: device.deviceName,
        apiToken: device.apiToken,
      };
    }

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
