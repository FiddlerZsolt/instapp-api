import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Sequelize from 'sequelize';
import chalk from 'chalk';
// import { format } from 'sql-formatter';
import { highlight } from 'sql-highlight';
import { logger } from '../utils/logger.js';
import { DATABASE } from '../constants.js';

// Get directory and filename info in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const db = {};

const sequelize = new Sequelize(DATABASE.NAME, DATABASE.USERNAME, DATABASE.PASSWORD, {
  host: DATABASE.HOST,
  port: DATABASE.PORT,
  dialect: 'postgres',
  define: {
    // The `timestamps` field specify whether or not the `createdAt` and `updatedAt` fields will be created.
    // This was true by default, but now is false by default
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
  },
  logging: DATABASE.DEBUG
    ? (sql, timing) => {
        // remove 'Executed (default): ' from the SQL string
        sql = sql.replace('Executed (default): ', '');
        // Format the SQL query
        // sql = format(sql, {
        //   language: 'spark',
        //   tabWidth: 2,
        //   keywordCase: 'upper',
        //   linesBetweenQueries: 2,
        // });
        logger.debug(`${chalk.bgBlue(' SQL ')}\n${highlight(sql)}\n${chalk.bgCyan(' Execution time ')} ${timing} ms\n`);
      }
    : false,
  benchmark: true,
});

// In ESM we need to use dynamic imports for the model files
const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1;
});

// Using Promise.all to handle all dynamic imports
const modelPromises = modelFiles.map(async (file) => {
  const modulePath = `file://${path.join(__dirname, file)}`;
  const module = await import(modulePath);
  const model = module.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

// Wait for all models to be loaded before setting up associations
await Promise.all(modelPromises);

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
export { sequelize, Sequelize };
export const { User, Device } = db;
