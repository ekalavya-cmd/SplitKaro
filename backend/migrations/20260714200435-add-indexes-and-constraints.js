'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove the global unique constraint on members.email
    await queryInterface.removeIndex("members", "email");

    // 2. Add composite unique index on members (group_id, email)
    await queryInterface.addIndex("members", ["group_id", "email"], {
      unique: true,
      name: "members_group_id_email_unique"
    });

    // 3. Add explicit secondary indexes
    await queryInterface.addIndex("expenses", ["group_id"], {
      name: "expenses_group_id"
    });
    await queryInterface.addIndex("expenses", ["paid_by"], {
      name: "expenses_paid_by"
    });
    await queryInterface.addIndex("expense_splits", ["expense_id"], {
      name: "expense_splits_expense_id"
    });
    await queryInterface.addIndex("expense_splits", ["member_id"], {
      name: "expense_splits_member_id"
    });
    await queryInterface.addIndex("settlements", ["group_id"], {
      name: "settlements_group_id"
    });

    // 4. Add composite unique index on expense_splits (expense_id, member_id)
    await queryInterface.addIndex("expense_splits", ["expense_id", "member_id"], {
      unique: true,
      name: "expense_splits_expense_id_member_id_unique"
    });

    // 5. Add database check constraints
    await queryInterface.sequelize.query(
      "ALTER TABLE expenses ADD CONSTRAINT check_expense_amount CHECK (amount > 0);"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE settlements ADD CONSTRAINT check_settlement_amount CHECK (amount > 0);"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE expense_splits ADD CONSTRAINT check_split_amount_owed CHECK (amount_owed >= 0);"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE settlements ADD CONSTRAINT check_settlement_self_pay CHECK (paid_by <> paid_to);"
    );
  },

  async down(queryInterface, Sequelize) {
    // 1. Drop check constraints
    await queryInterface.sequelize.query(
      "ALTER TABLE settlements DROP CONSTRAINT check_settlement_self_pay;"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE expense_splits DROP CONSTRAINT check_split_amount_owed;"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE settlements DROP CONSTRAINT check_settlement_amount;"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE expenses DROP CONSTRAINT check_expense_amount;"
    );

    // 2. Remove composite unique index on expense_splits
    await queryInterface.removeIndex("expense_splits", "expense_splits_expense_id_member_id_unique");

    // 3. Remove secondary indexes
    await queryInterface.removeIndex("settlements", "settlements_group_id");
    await queryInterface.removeIndex("expense_splits", "expense_splits_member_id");
    await queryInterface.removeIndex("expense_splits", "expense_splits_expense_id");
    await queryInterface.removeIndex("expenses", "expenses_paid_by");
    await queryInterface.removeIndex("expenses", "expenses_group_id");

    // 4. Remove composite unique index on members
    await queryInterface.removeIndex("members", "members_group_id_email_unique");

    // 5. Re-add global unique index on members.email
    await queryInterface.addIndex("members", ["email"], {
      unique: true,
      name: "email"
    });
  }
};
