"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expense_splits", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      expense_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "expenses",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      amount_owed: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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

    await queryInterface.addIndex("expense_splits", ["expense_id"], {
      name: "expense_splits_expense_id",
    });

    await queryInterface.addIndex("expense_splits", ["user_id"], {
      name: "expense_splits_user_id",
    });

    await queryInterface.addIndex("expense_splits", ["expense_id", "user_id"], {
      unique: true,
      name: "expense_splits_expense_id_user_id_unique",
    });

    await queryInterface.sequelize.query(
      "ALTER TABLE expense_splits ADD CONSTRAINT check_split_amount_owed CHECK (amount_owed >= 0);",
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("expense_splits");
  },
};
