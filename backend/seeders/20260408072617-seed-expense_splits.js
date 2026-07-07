"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("expense_splits", [
      {
        expense_id: 1,
        member_id: 1,
        amount_owed: 400.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 1,
        member_id: 2,
        amount_owed: 400.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 1,
        member_id: 3,
        amount_owed: 400.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 1,
        member_id: 4,
        amount_owed: 400.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 2,
        member_id: 1,
        amount_owed: 200.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 2,
        member_id: 2,
        amount_owed: 300.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 2,
        member_id: 3,
        amount_owed: 200.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 2,
        member_id: 4,
        amount_owed: 100.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 3,
        member_id: 1,
        amount_owed: 100.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 3,
        member_id: 2,
        amount_owed: 100.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 3,
        member_id: 3,
        amount_owed: 100.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 3,
        member_id: 4,
        amount_owed: 100.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 4,
        member_id: 1,
        amount_owed: 300.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 4,
        member_id: 2,
        amount_owed: 300.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 4,
        member_id: 3,
        amount_owed: 300.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 4,
        member_id: 4,
        amount_owed: 300.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 5,
        member_id: 1,
        amount_owed: 600.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 5,
        member_id: 2,
        amount_owed: 600.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 5,
        member_id: 3,
        amount_owed: 0.0,
        created_at: new Date(),
        updated_at: new Date(),
      },

      {
        expense_id: 5,
        member_id: 4,
        amount_owed: 800.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("expense_splits", null, {});
  },
};
