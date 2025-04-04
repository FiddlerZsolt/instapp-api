'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Devices', 'last_activity_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Date of last activity for the device',
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
