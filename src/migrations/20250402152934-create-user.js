'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        length: 50,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        length: 50,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        length: 255,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        length: 255,
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: false,
        length: 255,
      },
      bio: {
        type: Sequelize.STRING,
        length: 255,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Users');
  },
};
