import _ from 'lodash';
import crypto from 'crypto';
import Redis from 'ioredis';
import chalk from 'chalk';
import { Duration } from 'luxon';
import { logger } from './logger.js';

/**
 * Redis caching utility class for API response caching
 *
 * @class Cacher
 * @export {Cacher}
 *
 * @example
 * const cacher = new Cacher({
 *   prefix: 'MyAPI:',
 *   debug: true
 * }).init();
 *
 * // Store data in cache
 * await cacher.set('user:123', userData, 3600);
 *
 * // Retrieve cached data
 * const data = await cacher.get('user:123');
 *
 * // Delete cached data
 * await cacher.del('user:123');
 */
export default class Cacher {
  constructor(opts) {
    this.opts = {
      prefix: 'API:',
      maxParamsLength: 1000,
      port: 6379,
      host: '127.0.0.1',
      username: '',
      password: '',
      db: 0,
      ttl: 60 * 60,
      debug: process.env.REDIS_DEBUG === 'true',
      ...opts,
    };

    if (this.opts.debug) {
      logger.info(`${chalk.red('Redis')} client starts in ${chalk.bgBlue(' debug ')} mode`);
      logger.info('Redis options:', this.opts);
    }
  }

  /**
   * Initializes the Redis client and sets up event listeners.
   */
  init() {
    this.client = new Redis({
      port: this.opts.port,
      host: this.opts.host,
      username: this.opts.username,
      password: this.opts.password,
      db: this.opts.db,
    });

    const redIsText = chalk.red('Redis');

    this.client.on('connect', () => {
      logger.info(`${redIsText} client ${chalk.blueBright('connected')}`);
    });
    this.client.on('ready', () => {
      logger.info(`${redIsText} client ${chalk.green('ready')}`);
    });
    this.client.on('error', (err) => {
      logger.error(`${redIsText} ${chalk.red('error')}`, err);
    });
    this.client.on('end', () => {
      logger.info(`${redIsText} client ${chalk.yellowBright('disconnected')}`);
    });

    return this;
  }

  /**
   * Retrieves a value from the cache using the provided key.
   * If the key is null or undefined, it returns null.
   *
   * @param {string} key - The cache key to retrieve the value for.
   * @returns {Promise<any>} - The cached value or null if not found.
   *
   * @example
   * // Retrieve cached data
   * const data = await cacher.get('user:123');
   */
  async get(key) {
    if (key === null || key === undefined) return null;

    const prefixedKey = this.opts.prefix + key;

    if (this.opts.debug) {
      logger.info('\n\nGetting cache value');
      logger.info(`Key: ${prefixedKey}`);
    }

    try {
      const data = await this.client.getBuffer(prefixedKey);
      if (!data) return null;

      return JSON.parse(data);
    } catch (err) {
      logger.error('Redis result parse error.', err);
      return null;
    }
  }

  /**
   * Stores a value in the cache with an optional TTL (Time To Live).
   * If the key or data is null, it does nothing.
   *
   * @param {string} key - The cache key to store the value for.
   * @param {any} data - The data to cache.
   * @param {number} [ttl] - The time-to-live for the cached data in seconds.
   * @returns {Promise<"OK">} - The result of the cache operation.
   *
   * @example
   * // Set data in cache
   * await cacher.set('user:123', userData, 3600);
   *
   */
  async set(key, data, ttl) {
    if (this.opts.debug) {
      logger.info('\n\nSetting cache value: ', { key, ttl });
      logger.info('Data: ', data);
    }

    if (key == null || data == null) return;

    try {
      if (ttl == null) ttl = this.opts.ttl;

      const buf = Buffer.from(JSON.stringify(data));
      const prefixedKey = this.opts.prefix + key;

      const set = ttl ? this.client.set(prefixedKey, buf, 'EX', ttl) : this.client.set(prefixedKey, buf);

      return set.then((res) => {
        if (this.opts.debug) {
          logger.info('Cache save response:', chalk.greenBright(res));
        }
        return res;
      });
    } catch (e) {
      logger.error('Error setting cache value', e);
    }
  }

  /**
   * Deletes cache entries based on the provided key(s).
   *
   * @param {string|string[]} deleteTargets - The cache key(s) to delete.
   * @returns {Promise<boolean>} - Returns true if any keys were deleted, false otherwise.
   *
   * @example
   * // Delete a single cache entry
   * await cacher.del('user:123');
   *
   * // Delete multiple cache entries
   * await cacher.del(['user:123', 'user:456']);
   */
  async del(deleteTargets) {
    const targets = Array.isArray(deleteTargets) ? deleteTargets : [deleteTargets];

    try {
      const results = await Promise.all(
        targets.map(async (key) => {
          const pattern = `${this.opts.prefix}*${key}*`;

          if (this.opts.debug) {
            logger.info(`\nFinding keys matching pattern: ${chalk.yellow(pattern)}`);
          }

          const keys = await this.client.keys(pattern);

          if (keys.length === 0) {
            if (this.opts.debug) {
              logger.info(`No keys found matching pattern: ${pattern}\n`);
            }
            return 0;
          }

          if (this.opts.debug) {
            logger.info(`Found ${keys.length} keys to delete:\n${keys.join('\n')}\n`);
          }

          const result = await this.client.del(keys);

          if (this.opts.debug) {
            logger.info(`Cache delete response: ${chalk.greenBright(result)} keys removed\n`);
          }

          return result;
        })
      );

      return results.some((result) => result > 0);
    } catch (err) {
      logger.error(`Redis delete error:`, err);
      throw err;
    }
  }

  /**
   * Generates a unique key from an object by recursively converting it to a string.
   * This is useful for creating cache keys based on complex objects.
   *
   * @param {Object} obj - The object to generate a key from.
   * @returns {string} - The generated key as a string.
   *
   * @example
   * const obj = { id: 123, name: 'John Doe', nested: { age: 30 } };
   * const key = _generateKeyFromObject(obj);
   * // key: "id|123|name|John Doe|nested|age|30"
   */
  _generateKeyFromObject(obj) {
    if (obj === null || obj === undefined) return 'null';

    if (Array.isArray(obj)) {
      return '[' + obj.map((o) => this._generateKeyFromObject(o)).join('|') + ']';
    }

    if (_.isDate(obj)) return obj.valueOf();

    if (_.isObject(obj)) {
      return Object.keys(obj)
        .map((key) => `${key}|${this._generateKeyFromObject(obj[key])}`)
        .join('|');
    }

    return obj.toString();
  }

  /**
   * Generates a hashed key based on the provided key.
   * If the key length exceeds the specified maxParamsLength, it hashes the key using SHA-256.
   * This is useful for creating cache keys that are not too long while still being unique.
   *
   * @param {string} key - The key to hash.
   * @returns {string} - The hashed key.
   *
   * @example
   * const hashedKey = _hashedKey('long-key-string-that-exceeds-max-length');
   * // hashedKey: "shortened-key|hashed-value"
   */
  _hashedKey(key) {
    if (typeof key !== 'string') key = String(key);

    const maxParamsLength = this.opts.maxParamsLength || 1000;
    if (!maxParamsLength || maxParamsLength < 44 || key.length <= maxParamsLength) return key;

    const prefixLength = maxParamsLength - 44;

    const base64Hash = crypto.createHash('sha256').update(key).digest('base64');
    if (prefixLength < 1) return base64Hash;

    return key.substring(0, prefixLength) + base64Hash;
  }

  /**
   * Retrieves a value from the request parameters or metadata based on the provided key.
   * If the key starts with '#', it looks for the value in the metadata.
   * Otherwise, it looks for the value in the request parameters.
   *
   * @param {string} key - The key to retrieve the value for.
   * @param {Object} params - The request parameters.
   * @param {Object} meta - The request metadata.
   * @returns {any} - The retrieved value or undefined if not found.
   *
   * @example
   * const value = getParamMetaValue('#metaKey', params, meta);
   * // value: metaValue
   * const value2 = getParamMetaValue('paramKey', params, meta);
   * // value2: paramValue
   */
  getParamMetaValue(key, params, meta) {
    if (key.startsWith('#') && meta != null) return _.get(meta, key.slice(1));
    else if (params != null) return _.get(params, key);
  }

  /**
   * Generates a cache key based on the provided base key and request context.
   * It combines the base key with additional keys from the request parameters or metadata.
   * The generated key is hashed to ensure it doesn't exceed the maximum length.
   *
   * @param {string} cacheKey - The base cache key.
   * @param {Object} request - The request object containing context with parameters and metadata.
   * @param {Array<string>} keys - Additional keys to include in the cache key.
   * @returns {string} - The generated cache key.
   *
   * @example
   * const cacheKey = generateCacheKey('user', request, ['params.id', '#meta.key']);
   * // cacheKey: "user:hashed-value"
   *
   * @example
   * const cacheKey = generateCacheKey('user', request, []);
   * // cacheKey: "user:hashed-value"
   */
  generateCacheKey(cacheKey, request, keys) {
    const { params, meta } = request.context;
    if (!params && !meta) return cacheKey;

    const keyPrefix = cacheKey + ':';

    if (keys.length === 0) {
      if (this.opts.debug) logger.info('No keys provided', '\n');
      return keyPrefix + this._hashedKey(this._generateKeyFromObject(params));
    }

    if (keys.length === 1) {
      if (this.opts.debug) logger.info('Only one key provided:', keys[0], '\n');
      const val = this.getParamMetaValue(keys[0], params, meta);
      if (this.opts.debug) logger.info(`${keys[0]} value:`, val);
      return keyPrefix + this._hashedKey(_.isObject(val) ? this._generateKeyFromObject(val) : val);
    }

    // Multiple keys
    if (this.opts.debug) logger.info('Multiple keys provided:', keys.join(', '), '\n');

    const combinedValue = keys.reduce((acc, key, i) => {
      const val = this.getParamMetaValue(key, params, meta);
      if (this.opts.debug) logger.info(`${key} value:`, val);

      const valueStr = _.isObject(val) || Array.isArray(val) ? this._hashedKey(this._generateKeyFromObject(val)) : val;

      return acc + (i ? '|' : '') + valueStr;
    }, '');

    return keyPrefix + this._hashedKey(combinedValue);
  }
}

/**
 * Creates a cache middleware for Express routes.
 *
 * This middleware attempts to retrieve and serve cached data based on the provided options.
 * If cached data is found, it immediately sends the response and prevents further middleware execution.
 * If no cache is found, it passes control to the next middleware in the chain.
 *
 * @param {Object} options - The caching configuration options
 * @param {string|Function} options.key - Base cache key or function to generate it
 * @param {string|Function} options.duration - Base cache key or function to generate it
 * @param {Array<string>} [options.keys=[]] - Additional request properties to include in the cache key
 * @param {Object} [options.other] - Any other caching options passed to the cacher implementation
 *
 * @returns {Function} Express middleware function
 * @async
 *
 * @example
 * // Basic usage with a static key
 * app.get('/users', cache({ key: 'users-list' }), getUsersHandler);
 *
 * @example
 * // With dynamic keys from request parameters
 * app.get('/users/:id', cache({ key: 'user', keys: ['params.id'] }), getUserHandler);
 */
export const cache = (options) => async (req, res, next) => {
  req.context.$action.cacheOptions = options;
  const { cacher } = req.context;

  if (cacher.opts.debug) logger.debug('Cache options', options);
  try {
    // Get cache data
    const key = cacher.generateCacheKey(options.key, req, options.keys || []);
    if (cacher.opts.debug) logger.info('Cache key', key);

    const cachedData = await cacher.get(key);
    if (cachedData) {
      if (cacher.opts.debug) logger.info('Cache found');

      req.context.$action.isCache = true;
      return res.json(cachedData); // Return cached data and stop middleware chain
    }

    if (cacher.opts.debug) {
      logger.info('No cache found');
      logger.info('Cache miss - continuing to handler');
    }

    next(); // Only call next() if no cache was found
  } catch (error) {
    logger.error('Error in cache middleware:', error);
    next(); // Continue to handler on error
  }
};

/**
 * Middleware for caching HTTP responses.
 * This middleware extends the res.json method to cache successful GET requests based on provided options.
 *
 * @param {Object} req - Express request object containing the context with cacher and action information
 * @param {Object} req.context - Context object containing caching configuration
 * @param {Cacher} req.context.cacher - Cacher instance used for caching operations
 * @param {Object} req.context.$action - Action object potentially containing cache options
 * @param {Object} req.context.$action.cacheOptions - Configuration for caching the response
 * @param {string} req.context.$action.cacheOptions.key - Base cache key
 * @param {import('luxon').DurationLikeObject} [req.context.$action.cacheOptions.duration] - TTL (Time To Live) for cached data in seconds
 * @param {String[]} [req.context.$action.cacheOptions.keys] - Additional keys to include in cache key generation
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function to continue middleware chain
 *
 * @returns {void}
 */
export const cacheMiddleware = (req, res, next) => {
  const originalJson = res.json;
  const { cacher, $action } = req.context;

  res.json = async function (data) {
    if (!$action?.cacheOptions) {
      if (req.context.cacher.opts.debug) {
        logger.debug('No cache options provided');
      }
      return originalJson.call(this, data);
    }

    if (res.statusCode === 200 && req.method === 'GET' && !$action.isCache) {
      const { key, duration, keys } = $action.cacheOptions;
      const ttl = duration ?? cacher.opts.ttl;
      // Save cache data
      const cacheKey = cacher.generateCacheKey(key, req, keys || []);

      try {
        await cacher.set(cacheKey, data, ttl);
        if (cacher.opts.debug) {
          logger.info('Cached data saved...');
        }
      } catch (error) {
        logger.error('Error saving cache:', error);
      }
    }

    // Always return the response with the original json method
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Converts a duration object into seconds.
 *
 * @param {Object} duration - The duration object to convert. Expected to be compatible with the Duration.fromObject method.
 * @returns {number} The duration converted to seconds.
 *
 * @example
 * // Returns 3600 (1 hour in seconds)
 * cacheDuration({ hours: 1 });
 *
 * @example
 * // Returns 90 (1 minute and 30 seconds in seconds)
 * cacheDuration({ minutes: 1, seconds: 30 });
 */
export const cacheDuration = (duration) => {
  const dur = Duration.fromObject(duration);
  return dur.as('seconds');
};
