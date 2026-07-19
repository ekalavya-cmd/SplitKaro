"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add created_by — nullable FK to users.id
    // ON DELETE SET NULL: if the creating user is deleted, the group survives with a null creator
    await queryInterface.addColumn("groups", "created_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    });

    // Add invite_token — unique shareable token for group invite links
    // allowNull: false is safe here because the table is empty when this migration runs
    // unique: true is NOT set here — the addIndex below is the sole source of that constraint
    await queryInterface.addColumn("groups", "invite_token", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Unique index on invite_token — queried on every invite link lookup
    await queryInterface.addIndex("groups", ["invite_token"], {
      unique: true,
      name: "groups_invite_token",
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      // Drop the index before removing the column
      await queryInterface.removeIndex("groups", "groups_invite_token");
      await queryInterface.removeColumn("groups", "invite_token");
      await queryInterface.removeColumn("groups", "created_by");
    } catch (err) {
      console.error("Error reversing add-created-by-and-invite-token-to-groups migration:", err);
      throw err;
    }
  },
};
