import { cwd } from 'process';

const SERVER_CONFIGURATION = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    CREDENTIALS: this.NODE_ENV === 'production',
  },
};

const DATABASE = {
  HOST: process.env.DB_HOST || 'localhost',
  PORT: process.env.DB_PORT || 5432,
  USERNAME: process.env.DB_USERNAME || 'instapp-developer',
  PASSWORD: process.env.DB_PASSWORD || 'PaSs111',
  NAME: process.env.DB_DATABASE || 'instapp-dev',
  DIALECT: process.env.DIALECT || 'postgres',
  DEBUG: process.env.DB_DEBUG === 'true',
};

const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: process.env.REDIS_PORT || 6379,
  USERNAME: process.env.REDIS_USERNAME || 'default',
  PASSWORD: process.env.REDIS_PASSWORD || '',
  DB: process.env.REDIS_DB || 0,
  DEBUG: process.env.REDIS_DEBUG === 'true',
};

const LOGGER = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  REQUEST_LOG_LEVEL: process.env.REQUEST_LOG_LEVEL || 'info',
  LOG_DIR: `${cwd()}/storage/logs`,
  ERROR_LOG_FILE: 'error.log',
  COMBINED_LOG_FILE: 'combined.log',
  DATE_FORMAT: 'yyyy-MM-dd TT ZZ',
};

export { SERVER_CONFIGURATION, DATABASE, REDIS_CONFIG, LOGGER };
