"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("members", [
      {
        group_id: 1,
        name: "Alice",
        email: "alice@example.com",
        phone: "111-111-1111",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        group_id: 1,
        name: "Bob",
        email: "bob@example.com",
        phone: "222-222-2222",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        group_id: 1,
        name: "Charlie",
        email: "charlie@example.com",
        phone: "333-333-3333",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        group_id: 1,
        name: "David",
        email: "david@example.com",
        phone: "444-444-4444",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("members", null, {});
  },
};
