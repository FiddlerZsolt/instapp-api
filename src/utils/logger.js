import chalk from 'chalk';
import { DateTime } from 'luxon';
import { LOGGER } from '../constants.js';

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

export { logger };
