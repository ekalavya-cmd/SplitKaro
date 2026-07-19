"use strict";
/** @type {import('sequelize-cli').Migration} */

// Helper: finds and drops a FK constraint on a given table that references a given foreign table.
// Needed because Sequelize CLI-generated migrations don't give explicit constraint names —
// MySQL auto-generates them (e.g. expenses_ibfk_1), so we query INFORMATION_SCHEMA at runtime.
async function dropFkByReferencedTable(queryInterface, table, referencedTable) {
  const dbName = queryInterface.sequelize.config.database;
  const [rows] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = :db
       AND TABLE_NAME   = :table
       AND REFERENCED_TABLE_NAME = :ref`,
    { replacements: { db: dbName, table, ref: referencedTable }, type: queryInterface.sequelize.QueryTypes.SELECT }
  );
  if (!rows || !rows.CONSTRAINT_NAME) {
    throw new Error(
      `Could not find FK on ${table} referencing ${referencedTable}. Cannot drop it.`
    );
  }
  const constraintName = rows.CONSTRAINT_NAME;
  await queryInterface.sequelize.query(
    `ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraintName}\``
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. expenses.paid_by: drop old FK (→ members.id), add new FK (→ users.id) ──────────────

    // Drop the auto-named FK that was created when expenses was originally migrated (→ members.id)
    await dropFkByReferencedTable(queryInterface, "expenses", "members");

    // Add new FK: expenses.paid_by → users.id
    // onDelete: "RESTRICT" — a user cannot be deleted while they still have expenses attached.
    // Preserving expense history is more important than cascade-deleting when a user leaves.
    await queryInterface.addConstraint("expenses", {
      fields: ["paid_by"],
      type: "foreign key",
      name: "expenses_paid_by_users_fk",
      references: { table: "users", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // ── 2. expense_splits.member_id → user_id ────────────────────────────────────────────────

    // 2a. Drop the old FK on member_id (→ members.id) FIRST — MySQL error 1553 will occur
    //     if you try to drop an index that is still backing an active FK constraint.
    await dropFkByReferencedTable(queryInterface, "expense_splits", "members");

    // 2b. Drop the composite unique index (FK no longer blocks this)
    await queryInterface.removeIndex(
      "expense_splits",
      "expense_splits_expense_id_member_id_unique"
    );

    // 2c. Drop the secondary index on member_id
    await queryInterface.removeIndex("expense_splits", "expense_splits_member_id");

    // 2d. Rename the column: member_id → user_id
    await queryInterface.renameColumn("expense_splits", "member_id", "user_id");

    // 2e. Add new FK: expense_splits.user_id → users.id
    // onDelete: "RESTRICT" — same reasoning as expenses.paid_by above.
    await queryInterface.addConstraint("expense_splits", {
      fields: ["user_id"],
      type: "foreign key",
      name: "expense_splits_user_id_users_fk",
      references: { table: "users", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // 2f. Recreate the secondary index on the renamed column
    await queryInterface.addIndex("expense_splits", ["user_id"], {
      name: "expense_splits_user_id",
    });

    // 2g. Recreate the composite unique index using the new column name
    await queryInterface.addIndex("expense_splits", ["expense_id", "user_id"], {
      unique: true,
      name: "expense_splits_expense_id_user_id_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    try {
      // ── Reverse expense_splits changes ───────────────────────────────────────────────────────

      // Drop the new FK (→ users.id) FIRST — must remove FK before touching indexes it backs
      await queryInterface.removeConstraint(
        "expense_splits",
        "expense_splits_user_id_users_fk"
      );

      // Drop the new composite unique index
      await queryInterface.removeIndex(
        "expense_splits",
        "expense_splits_expense_id_user_id_unique"
      );

      // Drop the new secondary index on user_id
      await queryInterface.removeIndex("expense_splits", "expense_splits_user_id");

      // Rename user_id back to member_id
      await queryInterface.renameColumn("expense_splits", "user_id", "member_id");

      // Restore secondary index on member_id
      await queryInterface.addIndex("expense_splits", ["member_id"], {
        name: "expense_splits_member_id",
      });

      // Restore composite unique index on (expense_id, member_id)
      await queryInterface.addIndex("expense_splits", ["expense_id", "member_id"], {
        unique: true,
        name: "expense_splits_expense_id_member_id_unique",
      });

      // Restore FK on member_id → members.id (members table still exists at this point in history)
      await queryInterface.addConstraint("expense_splits", {
        fields: ["member_id"],
        type: "foreign key",
        name: "expense_splits_member_id_members_fk",
        references: { table: "members", field: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      // ── Reverse expenses.paid_by changes ────────────────────────────────────────────────────

      // Drop the new FK (→ users.id)
      await queryInterface.removeConstraint("expenses", "expenses_paid_by_users_fk");

      // Restore FK on paid_by → members.id
      await queryInterface.addConstraint("expenses", {
        fields: ["paid_by"],
        type: "foreign key",
        name: "expenses_paid_by_members_fk",
        references: { table: "members", field: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    } catch (err) {
      console.error(
        "Error reversing repoint-expenses-expense-splits-to-users migration:",
        err
      );
      throw err;
    }
  },
};
