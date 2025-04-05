import { User, Device } from '../models/index.js';
import { UnauthorizedError } from '../utils/errors.js';

export const authorization = async (req, res, next) => {
  try {
    // let token;

    // Check for JWT token in Authorization header
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //   token = req.headers.authorization.split(' ')[1];

    //   // Verify the token
    //   const decoded = jwt.verify(token, JWT_SECRET, {
    //     algorithms: ['HS256'],
    //     issuer: 'your-api-name',
    //     maxAge: '1d',
    //   });

    //   // Get user from database without password
    //   const user = await User.findByPk(decoded.id, {
    //     attributes: { exclude: ['password'] },
    //   });

    //   if (!user) {
    //     throw new UnauthorizedError();
    //   }

    //   // Add user to request object
    //   req.user = user;
    //   return next();
    // }

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
      // req.context.meta.user = device?.user || null;
      req.context.device = device;
      return next();
    }

    // If no token was found
    throw new UnauthorizedError();
  } catch (error) {
    // If error is already one of our custom errors, pass it along
    console.error(error);
    return res.status(error.statusCode).json(error);
  }
};
