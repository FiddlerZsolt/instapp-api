import winston from 'winston';
import path from 'path';
import chalk from 'chalk';
import { DateTime } from 'luxon';
import { env } from 'process';
import { LOGGER } from '../constants.js';

const { combine, timestamp, printf, json } = winston.format;

const errorTypeFilter = (type) => {
  return winston.format((info) => {
    if (info.code === type) {
      return false; // Exclude log otherwise
    }
    return info; // Retain log if it matches the specific error type
  })();
};

const generateLogTable = (data) => {
  const { level, requestId, method, url, responseTime, statusCode, isCache } = data;
  const tableWidth = 80;
  const currentDateTime = DateTime.now().toFormat(LOGGER.DATE_FORMAT);
  const chars = {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
    joinRight: '├',
    joinLeft: '┤',
  };

  let color;
  switch (level) {
    case 'error':
      color = chalk.red;
      break;
    case 'warn':
      color = chalk.yellow;
      break;
    case 'info':
      color = chalk.whiteBright;
      break;
    case 'debug':
      color = chalk.blue;
      break;
    default:
      color = chalk.white;
  }

  // Create header components
  const timeInfo = `${currentDateTime}`;
  // const envInfo = `${envText}`;
  const environtmentInfoPadding = tableWidth - timeInfo.length - 2;

  let duration = responseTime;
  if (responseTime > 1000) duration = `${Number(responseTime / 1000)} s`;
  else duration = `${Number(responseTime)} ms`;

  const headerInfo = `ID: ${requestId}`;
  const responseInfo = `${duration}`;
  const headerPadding = tableWidth - headerInfo.length - responseInfo.length - 2;

  // Create main content
  const requestInfo = `<= ${statusCode} ${method} ${url}${isCache ? ' *' : ''}`;
  const contentPadding = tableWidth - requestInfo.length - 2;

  return color(
    // Time and environment info
    `${chars.topLeft}${chars.horizontal.repeat(tableWidth)}${chars.topRight}\n` +
      `${chars.vertical} ${timeInfo}${' '.repeat(environtmentInfoPadding)} ${chars.vertical}\n` +
      `${chars.vertical}${' '.repeat(tableWidth)}${chars.vertical}\n` +
      // Header info
      `${chars.vertical} ${headerInfo}${' '.repeat(headerPadding)}${responseInfo} ${chars.vertical}\n` +
      `${chars.joinRight}${chars.horizontal.repeat(tableWidth)}${chars.joinLeft}\n` +
      // Request info
      `${chars.vertical} ${requestInfo}${' '.repeat(contentPadding)} ${chars.vertical}\n` +
      // Bottom line
      `${chars.bottomLeft}${chars.horizontal.repeat(tableWidth)}${chars.bottomRight}`
  );
};

// Configure Winston logger
const requestLogger = winston.createLogger({
  level: LOGGER.REQUEST_LOG_LEVEL,
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: combine(printf((data) => generateLogTable(data))),
    }),
    new winston.transports.File({
      filename: path.join(LOGGER.LOG_DIR, '/', LOGGER.ERROR_LOG_FILE),
      level: 'error',
      format: combine(errorTypeFilter('VALIDATION_ERROR'), json()),
    }),
    new winston.transports.File({
      filename: path.join(LOGGER.LOG_DIR, '/', LOGGER.COMBINED_LOG_FILE),
      format: combine(errorTypeFilter('VALIDATION_ERROR'), json()),
    }),
  ],
});

const logger = {
  formatLogMessage: function (level) {
    // Change the color of the log message based on the level
    let color = chalk.white;
    switch (level) {
      case 'error':
        color = chalk.red;
        break;
      case 'warn':
        color = chalk.yellow;
        break;
      case 'info':
        color = chalk.blue;
        break;
      case 'debug':
        color = chalk.green;
        break;
      default:
        color = chalk.white;
        break;
    }

    // Format the date
    const formattedDate = DateTime.now().toFormat(LOGGER.DATE_FORMAT);

    return `${formattedDate} ${color(`[${level}]`)}`;
  },
  info: function (...args) {
    console.info(this.formatLogMessage('info'), ...args);
  },
  warn: function (...args) {
    console.warn(this.formatLogMessage('warn'), ...args);
  },
  error: function (...args) {
    console.error(this.formatLogMessage('error'), ...args);
  },
  debug: function (...args) {
    console.debug(this.formatLogMessage('debug'), ...args);
  },
  log: function (...args) {
    console.log(this.formatLogMessage('log'), ...args);
  },
};

const winstonMiddleware = (req, res, next) => {
  const start = Date.now(); // Record the start time

  // Listen for the response to finish
  res.on('finish', () => {
    // Calculate duration
    const duration = Date.now() - start;
    const loggerType = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.url,
      env: env.NODE_ENV || 'development',
      headers: req.headers,
      params: req.context.params,
      responseTime: duration,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      body: req.body,
      isCache: req.context.$action.isCache,
    };

    // Log the request using winston
    requestLogger[loggerType](`Request ID: ${req.id} - ${req.method} ${req.url} - ${duration}ms`, logData);
  });
  next();
};

export { requestLogger, winstonMiddleware, logger };
