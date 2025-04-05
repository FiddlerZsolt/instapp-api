import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from 'process';
import chalk from 'chalk';
import { DateTime } from 'luxon';

const { combine, timestamp, printf, json } = winston.format;

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const tableWidth = 100;
  const currentDateTime = DateTime.now().toFormat('yyyy-MM-dd TT ZZ');
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
  // const environtmentInfoPadding = tableWidth - timeInfo.length - envInfo.length - 3;
  const environtmentInfoPadding = tableWidth - timeInfo.length - 2;

  const headerInfo = `ID: ${requestId}`;
  const responseInfo = `${responseTime}ms`;
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
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: combine(printf((data) => generateLogTable(data))),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../storage/logs/error.log'),
      level: 'error',
      format: combine(errorTypeFilter('VALIDATION_ERROR'), json()),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../storage/logs/combined.log'),
      format: combine(errorTypeFilter('VALIDATION_ERROR'), json()),
    }),
  ],
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: combine(
        printf((data) => {
          const { level, message } = data;
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
          }
          // return color(`${DateTime.now()} [${level}] ${message}`);
          return color(`${DateTime.now().toFormat('yyyy-MM-dd TT ZZ')} [${level}] ${message}`);
        })
      ),
    }),
  ],
});

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
      isCache: req.context.isCache,
    };

    // Log the request using winston
    requestLogger[loggerType](`Request ID: ${req.id} - ${req.method} ${req.url} - ${duration}ms`, logData);
  });
  next();
};

export { requestLogger, winstonMiddleware, logger };
