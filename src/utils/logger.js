import chalk from 'chalk';
import { DateTime } from 'luxon';
import { LOGGER } from '../constants.js';

const COLORS = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.blue,
  debug: chalk.green,
  log: chalk.white,
};

export const logger = {
  level: 'debug', // Default log level

  formatLogMessage: function (level) {
    const color = COLORS[level] || chalk.white;
    const formattedDate = DateTime.now().toFormat(LOGGER.DATE_FORMAT);
    return `${formattedDate} ${color(`[${level}]`)}`;
  },
};

// Log levels in order of importance
const LOG_LEVELS = ['error', 'warn', 'info', 'debug', 'log'];

// Add log methods dynamically
LOG_LEVELS.forEach((level, index) => {
  logger[level] = function (...args) {
    // Only log if the current level is sufficient
    const currentLevelIndex = LOG_LEVELS.indexOf(this.level);
    if (index <= currentLevelIndex) {
      console[level](this.formatLogMessage(level), ...args);
    }
  };
});
