"use strict";
/** @type {import('sequelize-cli').Migration} */

// Helper: finds and drops a FK constraint on a specific column of a given table.
// Targets by both REFERENCED_TABLE_NAME and COLUMN_NAME to handle the case where
// multiple columns (paid_by, paid_to) reference the same foreign table (members/users).
// Needed because Sequelize CLI-generated migrations don't give explicit constraint names —
// MySQL auto-generates them (e.g. settlements_ibfk_1), so we query INFORMATION_SCHEMA at runtime.
async function dropFkByColumnAndReferencedTable(
  queryInterface,
  table,
  column,
  referencedTable
) {
  const dbName = queryInterface.sequelize.config.database;
  const [rows] = await queryInterface.sequelize.query(
    `SELECT CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA         = :db
       AND TABLE_NAME           = :table
       AND COLUMN_NAME          = :col
       AND REFERENCED_TABLE_NAME = :ref`,
    {
      replacements: { db: dbName, table, col: column, ref: referencedTable },
      type: queryInterface.sequelize.QueryTypes.SELECT,
    }
  );
  if (!rows || !rows.CONSTRAINT_NAME) {
    throw new Error(
      `Could not find FK on ${table}.${column} referencing ${referencedTable}. Cannot drop it.`
    );
  }
  const constraintName = rows.CONSTRAINT_NAME;
  await queryInterface.sequelize.query(
    `ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraintName}\``
  );
}

module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 0. Drop the check constraint that references paid_by ─────────────────────────────────
    // MySQL (8.0) blocks adding a FK referential action (RESTRICT/CASCADE) on a column that is
    // referenced in a CHECK constraint. Drop it first; we'll restore it after the FK changes.
    await queryInterface.sequelize.query(
      "ALTER TABLE `settlements` DROP CHECK `check_settlement_self_pay`"
    );

    // ── 1. settlements.paid_by: drop old FK (→ members.id), add new FK (→ users.id) ───────────

    // Drop the auto-named FK on paid_by FIRST — MySQL error 1553 if an index backing an active
    // FK is dropped before the FK itself.
    await dropFkByColumnAndReferencedTable(
      queryInterface,
      "settlements",
      "paid_by",
      "members"
    );

    // Drop the implicit index MySQL created to back the paid_by FK (named "paid_by" in this DB)
    await queryInterface.removeIndex("settlements", "paid_by");

    // Add explicit secondary index on paid_by FIRST — so MySQL uses this named index to back
    // the FK below, rather than auto-creating its own implicit index (which would be redundant).
    await queryInterface.addIndex("settlements", ["paid_by"], {
      name: "settlements_paid_by",
    });

    // Add new FK: settlements.paid_by → users.id (uses the index created above)
    // onDelete: "RESTRICT" — deleting a user who has settlement history shouldn't cascade-delete
    // those records; other members' balances depend on this history being preserved.
    await queryInterface.addConstraint("settlements", {
      fields: ["paid_by"],
      type: "foreign key",
      name: "settlements_paid_by_users_fk",
      references: { table: "users", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // ── 2. settlements.paid_to: drop old FK (→ members.id), add new FK (→ users.id) ───────────

    // Drop the auto-named FK on paid_to FIRST
    await dropFkByColumnAndReferencedTable(
      queryInterface,
      "settlements",
      "paid_to",
      "members"
    );

    // Drop the implicit index MySQL created to back the paid_to FK (named "paid_to" in this DB)
    await queryInterface.removeIndex("settlements", "paid_to");

    // Add explicit secondary index on paid_to FIRST — so MySQL uses this named index to back
    // the FK below, rather than auto-creating its own implicit index (which would be redundant).
    await queryInterface.addIndex("settlements", ["paid_to"], {
      name: "settlements_paid_to",
    });

    // Add new FK: settlements.paid_to → users.id (uses the index created above)
    // onDelete: "RESTRICT" — same reasoning as paid_by above.
    await queryInterface.addConstraint("settlements", {
      fields: ["paid_to"],
      type: "foreign key",
      name: "settlements_paid_to_users_fk",
      references: { table: "users", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // ── 3. Restore the check constraint now that both FKs are in place ───────────────────────
    await queryInterface.sequelize.query(
      "ALTER TABLE `settlements` ADD CONSTRAINT `check_settlement_self_pay` CHECK (`paid_by` <> `paid_to`)"
    );
  },

  async down(queryInterface, Sequelize) {
    try {
      // ── 0. Drop the check constraint first — same MySQL restriction applies in reverse ──────
      await queryInterface.sequelize.query(
        "ALTER TABLE `settlements` DROP CHECK `check_settlement_self_pay`"
      );

      // ── Reverse paid_to changes ──────────────────────────────────────────────────────────────

      // Drop the new FK FIRST — must remove FK before dropping the index it backs
      await queryInterface.removeConstraint(
        "settlements",
        "settlements_paid_to_users_fk"
      );

      // Drop the new explicit index on paid_to
      await queryInterface.removeIndex("settlements", "settlements_paid_to");

      // Restore index on paid_to FIRST, then restore FK so MySQL uses the named index
      await queryInterface.addIndex("settlements", ["paid_to"], {
        name: "settlements_paid_to",
      });

      // Restore FK on paid_to → members.id (members table still exists at this point in history)
      await queryInterface.addConstraint("settlements", {
        fields: ["paid_to"],
        type: "foreign key",
        name: "settlements_paid_to_members_fk",
        references: { table: "members", field: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      // ── Reverse paid_by changes ──────────────────────────────────────────────────────────────

      // Drop the new FK FIRST
      await queryInterface.removeConstraint(
        "settlements",
        "settlements_paid_by_users_fk"
      );

      // Drop the new explicit index on paid_by
      await queryInterface.removeIndex("settlements", "settlements_paid_by");

      // Restore index on paid_by FIRST, then restore FK so MySQL uses the named index
      await queryInterface.addIndex("settlements", ["paid_by"], {
        name: "settlements_paid_by",
      });

      // Restore FK on paid_by → members.id
      await queryInterface.addConstraint("settlements", {
        fields: ["paid_by"],
        type: "foreign key",
        name: "settlements_paid_by_members_fk",
        references: { table: "members", field: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      // ── Restore the check constraint after all FKs are back in place ──────────────────────
      await queryInterface.sequelize.query(
        "ALTER TABLE `settlements` ADD CONSTRAINT `check_settlement_self_pay` CHECK (`paid_by` <> `paid_to`)"
      );
    } catch (err) {
      console.error(
        "Error reversing repoint-settlements-to-users migration:",
        err
      );
      throw err;
    }
  },
};
