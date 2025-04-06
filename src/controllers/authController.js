import bcrypt from 'bcryptjs';
import { User, Device, sequelize } from '../models/index.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Register user
 *
 * @route POST /auth/register
 * @group Auth - Operations about user
 * @returns {object} 201 - Created
 * @returns {object} 400 - Bad request
 * @returns {object} 500 - Server error
 */
export const register = async (req, res, next) => {
  const { name, username, email, password } = req.context.params;

  // Check if user already exists
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new ValidationError('User with this email already exists');
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

    return ApiResponse.created(res, ApiResponse.baseResponse(true));
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

/**
 * Login user
 *
 * @route POST /auth/login
 * @group Auth - Operations about user
 * @returns {object} 200 - Success
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Server error
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const unAuthError = new UnauthorizedError();

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw unAuthError;
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw unAuthError;
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
    next(error);
  }
};

/**
 * Get current user
 *
 * @route GET /auth/me
 * @group Auth - Operations about user
 * @returns {object} 200 - User object
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Server error
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const notFoundError = new NotFoundError('User not found');

    if (!req.context?.meta?.user) {
      logger.error('User not found in context');
      throw notFoundError;
    }

    const user = await User.findByPk(req.context.meta.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      logger.error('User not found in database');
      throw notFoundError;
    }

    res.json(new ApiResponse(user));
  } catch (error) {
    logger.error('Get current user error:', error);
    next(error);
  }
};
