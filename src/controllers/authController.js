import bcrypt from 'bcryptjs';
import { User, Device, sequelize } from '../models/index.js';
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';
import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Register a new user
export const register = async (req, res) => {
  const { name, username, email, password } = req.context.params;

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

  try {
    // Use transaction to create user and update device
    await sequelize.transaction(async () => {
      // both of these queries will run in the transaction
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        name: name || username, // Using username as name if not provided
        profileImage: '', // Default empty profile image
      });

      await Device.update(
        { userId: user.id },
        {
          where: {
            id: req.context.meta.device.id,
          },
        }
      );

      return user;
    });

    res.status(201).json(ApiResponse.baseResponse(true));
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const unAuthError = new UnauthorizedError();

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json(unAuthError);
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(unAuthError);
    }

    await Device.update(
      { userId: user.id },
      {
        where: {
          id: req.context.meta.device.id,
        },
      }
    );

    res.json(ApiResponse.baseResponse(true));
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in user',
    });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const notFoundError = new NotFoundError('User not found');

    if (!req.context?.meta?.user) {
      return res.status(404).json(notFoundError);
    }

    const user = await User.findByPk(req.context.meta.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json(notFoundError);
    }

    res.json(user);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
