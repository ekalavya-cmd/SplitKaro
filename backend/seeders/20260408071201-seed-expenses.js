"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("expenses", [
      {
        group_id: 1,
        paid_by: 1,
        amount: 1600.0,
        description: "Hotel booking",
        split_type: "equal",
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        group_id: 1,
        paid_by: 2,
        amount: 800.0,
        description: "Dinner at restaurant",
        split_type: "exact",
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        group_id: 1,
        paid_by: 3,
        amount: 400.0,
        description: "Taxi fare",
        split_type: "equal",
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        group_id: 1,
        paid_by: 1,
        amount: 1200.0,
        description: "beach club tickets",
        split_type: "equal",
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        group_id: 1,
        paid_by: 4,
        amount: 2000.0,
        description: "drinks at beach club",
        split_type: "percentage",
        date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("expenses", null, {});
  },
};
