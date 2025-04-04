require('dotenv').config();

const Sequelize = require('sequelize');

// if (process.env.NODE_ENV === 'development') {
//   console.log('DB debug:', {
//     DB_NAME: process.env.DB_NAME,
//     DB_USER: process.env.DB_USER,
//     DB_PASS: process.env.DB_PASS,
//     DB_HOST: process.env.DB_HOST,
//     DB_PORT: process.env.DB_PORT,
//   });
// }

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: true,
});

sequelize
  .authenticate()
  .then(() => console.log('PostgreSQL connection established successfully!'))
  .catch((err) => console.error('Database connection error:', err.message));

module.exports = sequelize;
