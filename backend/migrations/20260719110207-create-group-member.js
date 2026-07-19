"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("group_members", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "groups",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      joined_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    // Secondary index on user_id — used when loading all groups a user belongs to
    await queryInterface.addIndex("group_members", ["user_id"], {
      name: "group_members_user_id",
    });

    // Secondary index on group_id — used when loading all members of a group
    await queryInterface.addIndex("group_members", ["group_id"], {
      name: "group_members_group_id",
    });

    // Composite unique index — prevents the same user from joining the same group twice
    await queryInterface.addIndex("group_members", ["user_id", "group_id"], {
      unique: true,
      name: "group_members_user_id_group_id_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable("group_members");
    } catch (err) {
      console.error("Error dropping group_members table:", err);
      throw err;
    }
  },
};