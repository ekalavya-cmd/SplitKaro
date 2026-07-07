"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("settlements", [
      {
        group_id: 1,
        paid_by: 2,
        paid_to: 1,
        amount: 900.0,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        group_id: 1,
        paid_by: 3,
        paid_to: 1,
        amount: 300.0,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        group_id: 1,
        paid_by: 3,
        paid_to: 4,
        amount: 300.0,
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("settlements", null, {});
  },
};
