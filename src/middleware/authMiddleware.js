import { User, Device } from '../models/index.js';
import { UnauthorizedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const authorization = async (req, res, next) => {
  try {
    // Check for API token in X-API-Token header
    if (req.headers['x-api-token']) {
      const apiToken = req.headers['x-api-token'];

      // Find device with the API token
      const device = await Device.findOne({
        where: { apiToken },
        include: [
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['password'] },
          },
        ],
      });

      if (!device) {
        throw new UnauthorizedError();
      }

      // Add user and device to request object
      req.context.meta.device = device.toJSON();
      req.context.meta.user = device.user.toJSON();

      // if (process.env.NODE_ENV === 'development') {
      //  logger.info('Authenticated:', req.context.meta);
      // }
      return next();
    }

    // If no token was found
    throw new UnauthorizedError();
  } catch (error) {
    // If error is already one of our custom errors, pass it along
    logger.error(error);
    return res.status(error.statusCode).json(error);
  }
};
