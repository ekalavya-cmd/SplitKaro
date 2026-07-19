"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. paid_by (finish what was interrupted)
      // Index settlements_paid_by already exists. Just add the FK.
      await queryInterface.addConstraint("settlements", {
        fields: ["paid_by"],
        type: "foreign key",
        name: "settlements_paid_by_users_fk",
        references: { table: "users", field: "id" },
        onDelete: "RESTRICT",
        transaction,
      });

      // 2. paid_to (repoint from members to users)
      // Drop existing original FK settlements_ibfk_3
      await queryInterface.removeConstraint(
        "settlements",
        "settlements_ibfk_3",
        { transaction }
      );

      // Drop existing implicit index named paid_to
      await queryInterface.removeIndex("settlements", "paid_to", {
        transaction,
      });

      // Add new explicit named index
      await queryInterface.addIndex("settlements", ["paid_to"], {
        name: "settlements_paid_to",
        transaction,
      });

      // Add new FK
      await queryInterface.addConstraint("settlements", {
        fields: ["paid_to"],
        type: "foreign key",
        name: "settlements_paid_to_users_fk",
        references: { table: "users", field: "id" },
        onDelete: "RESTRICT",
        transaction,
      });

      // 3. Recreate the check constraint
      // Must be done AFTER both FKs are in place
      await queryInterface.sequelize.query(
        "ALTER TABLE `settlements` ADD CONSTRAINT `check_settlement_self_pay` CHECK (`paid_by` <> `paid_to`)",
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      console.error("Error applying repair migration:", err);
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Drop check constraint first
      await queryInterface.sequelize.query(
        "ALTER TABLE `settlements` DROP CHECK `check_settlement_self_pay`",
        { transaction }
      );

      // 2. Reverse paid_to changes
      // Drop the new FK
      await queryInterface.removeConstraint(
        "settlements",
        "settlements_paid_to_users_fk",
        { transaction }
      );

      // Drop the new explicit index
      await queryInterface.removeIndex("settlements", "settlements_paid_to", {
        transaction,
      });

      // Restore implicit-style index for paid_to
      await queryInterface.addIndex("settlements", ["paid_to"], {
        name: "paid_to",
        transaction,
      });

      // Restore original FK settlements_ibfk_3
      await queryInterface.addConstraint("settlements", {
        fields: ["paid_to"],
        type: "foreign key",
        name: "settlements_ibfk_3",
        references: { table: "members", field: "id" },
        onDelete: "CASCADE",
        transaction,
      });

      // 3. Reverse paid_by changes
      // Drop the new FK, but leave the settlements_paid_by index in place (since it predates this repair)
      await queryInterface.removeConstraint(
        "settlements",
        "settlements_paid_by_users_fk",
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      console.error("Error reversing repair migration:", err);
      await transaction.rollback();
      throw err;
    }
  },
};
