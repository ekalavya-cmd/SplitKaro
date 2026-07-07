"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("groups", [
      {
        name: "Trip to Bali Expenses",
        description: "Group for managing expenses during our trip to Bali",
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        name: "Household Expenses",
        description: "Group for managing shared household expenses",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("groups", null, {});
  },
};
