"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      password_hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      google_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      avatar_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Explicit index on email — queried on every login attempt
    await queryInterface.addIndex("users", ["email"], {
      unique: true,
      name: "users_email",
    });

    // Explicit index on google_id — queried on every Google OAuth login
    await queryInterface.addIndex("users", ["google_id"], {
      unique: true,
      name: "users_google_id",
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable("users");
    } catch (err) {
      console.error("Error dropping users table:", err);
      throw err;
    }
  },
};
