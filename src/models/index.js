import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Sequelize from 'sequelize';

// Load environment variables
dotenv.config();

// Get directory and filename info in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);

const db = {};

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  define: {
    // The `timestamps` field specify whether or not the `createdAt` and `updatedAt` fields will be created.
    // This was true by default, but now is false by default
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
  },
  logging: false,
  benchmark: false,
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
