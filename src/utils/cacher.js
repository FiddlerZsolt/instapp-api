import _ from 'lodash';
import crypto from 'crypto';
import Redis from 'ioredis';
import chalk from 'chalk';
import { Duration } from 'luxon';
import { logger } from './logger.js';

export default class Cacher {
  constructor(opts) {
    this.opts = {
      prefix: 'API:',
      maxParamsLength: 1000,
      port: 6379,
      host: '127.0.0.1',
      username: 'default',
      password: 'my-top-secret',
      db: 0,
      ttl: 60 * 60,
      debug: false,
      ...opts,
    };

    if (this.opts.debug) {
      logger.info(`${chalk.red('Redis')} client starts in ${chalk.bgBlue(' debug ')} mode`);
      logger.info('Redis options:', this.opts);
    }
  }

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

  _hashedKey(key) {
    if (typeof key !== 'string') key = String(key);

    const maxParamsLength = this.opts.maxParamsLength || 1000;
    if (!maxParamsLength || maxParamsLength < 44 || key.length <= maxParamsLength) return key;

    const prefixLength = maxParamsLength - 44;

    const base64Hash = crypto.createHash('sha256').update(key).digest('base64');
    if (prefixLength < 1) return base64Hash;

    return key.substring(0, prefixLength) + base64Hash;
  }

  getParamMetaValue(key, params, meta) {
    if (key.startsWith('#') && meta != null) return _.get(meta, key.slice(1));
    else if (params != null) return _.get(params, key);
  }

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

export const cache = (options) => async (req, res, next) => {
  req.context.cacheOptions = options;
  const { cacher } = req.context;

  if (cacher.opts.debug) logger.debug('Cache options', options);
  try {
    // Get cache data
    const key = cacher.generateCacheKey(options.key, req, options.keys || []);
    if (cacher.opts.debug) logger.info('Cache key', key);

    const cachedData = await cacher.get(key);
    if (cachedData) {
      if (cacher.opts.debug) logger.info('Cache found');

      req.context.isCache = true;
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

export const saveCacheMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = async function (data) {
    if (!req?.context?.cacheOptions) {
      if (req.context.cacher.opts.debug) {
        logger.debug('No cache options provided');
      }
      return originalJson.call(this, data);
    }

    if (res.statusCode === 200 && req.method === 'GET' && !req.context.isCache) {
      const { key, duration, keys } = req.context.cacheOptions;
      const ttl = duration ?? req.context.cacher.opts.ttl;
      // Save cache data
      const cacheKey = req.context.cacher.generateCacheKey(key, req, keys || []);

      try {
        await req.context.cacher.set(cacheKey, data, ttl);
        if (req.context.cacher.opts.debug) {
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

export const cacheDuration = (duration) => {
  const dur = Duration.fromObject(duration);
  return dur.as('seconds');
};
