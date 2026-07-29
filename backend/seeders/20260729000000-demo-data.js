"use strict";

const bcrypt = require("bcrypt");
const { splitAmount, distributeRemainder } = require("../utils/splitMath");

const BCRYPT_ROUNDS = 12;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Users
    const passwordHash = await bcrypt.hash("user@123", BCRYPT_ROUNDS);
    
    const users = [
      { id: 1, name: "Alice", email: "alice@gmail.com", password_hash: passwordHash, google_id: null, is_email_verified: false, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: "Bob", email: "bob@gmail.com", password_hash: passwordHash, google_id: null, is_email_verified: false, created_at: new Date(), updated_at: new Date() },
      { id: 3, name: "Charlie", email: "charlie@gmail.com", password_hash: passwordHash, google_id: null, is_email_verified: false, created_at: new Date(), updated_at: new Date() },
      { id: 4, name: "David", email: "david@gmail.com", password_hash: passwordHash, google_id: null, is_email_verified: false, created_at: new Date(), updated_at: new Date() },
      { id: 5, name: "Eve", email: "eve@gmail.com", password_hash: passwordHash, google_id: null, is_email_verified: false, created_at: new Date(), updated_at: new Date() },
      { id: 6, name: "Frank", email: "frank@gmail.com", password_hash: passwordHash, google_id: null, is_email_verified: false, created_at: new Date(), updated_at: new Date() },
      { id: 7, name: "Grace", email: "grace@gmail.com", password_hash: passwordHash, google_id: null, is_email_verified: false, created_at: new Date(), updated_at: new Date() },
    ];
    await queryInterface.bulkInsert("users", users, {});

    // 2. Groups
    const groups = [
      { id: 1, name: "Goa Trip", description: "Weekend getaway", created_by: 1, invite_token: "goa-trip-uuid-1", created_at: new Date(), updated_at: new Date() },
      { id: 2, name: "Manali Trip", description: "Winter vacation", created_by: 4, invite_token: "manali-trip-uuid-2", created_at: new Date(), updated_at: new Date() },
    ];
    await queryInterface.bulkInsert("groups", groups, {});

    // 3. Group Members
    const groupMembers = [
      // Goa Trip (3 members)
      { group_id: 1, user_id: 1, created_at: new Date(), updated_at: new Date() },
      { group_id: 1, user_id: 2, created_at: new Date(), updated_at: new Date() },
      { group_id: 1, user_id: 3, created_at: new Date(), updated_at: new Date() },
      // Manali Trip (4 members)
      { group_id: 2, user_id: 4, created_at: new Date(), updated_at: new Date() },
      { group_id: 2, user_id: 5, created_at: new Date(), updated_at: new Date() },
      { group_id: 2, user_id: 6, created_at: new Date(), updated_at: new Date() },
      { group_id: 2, user_id: 7, created_at: new Date(), updated_at: new Date() },
    ];
    await queryInterface.bulkInsert("group_members", groupMembers, {});

    // 4. Expenses and Splits setup
    const expenses = [];
    const expenseSplits = [];
    let expenseIdCounter = 1;
    let splitIdCounter = 1;

    // Helper to generate dates spanning the last 60 days
    const now = new Date();
    const getDate = (offsetDays) => {
      const d = new Date(now);
      d.setDate(d.getDate() - offsetDays);
      return d;
    };

    // Goa Trip (12 expenses)
    const goaMembers = [1, 2, 3];
    const goaConfigs = [
      { amount: 1500, type: "equal", payer: 1, offset: 5 },
      { amount: 750.5, type: "equal", payer: 2, offset: 12 },
      { amount: 300, type: "exact", payer: 3, offset: 15, exact: [100, 150, 50] },
      { amount: 2000, type: "percentage", payer: 1, offset: 18, pct: [40, 40, 20] },
      { amount: 125, type: "equal", payer: 2, offset: 25 },
      { amount: 450, type: "exact", payer: 1, offset: 28, exact: [0, 450, 0] },
      { amount: 3333, type: "equal", payer: 3, offset: 35 },
      { amount: 100, type: "percentage", payer: 2, offset: 40, pct: [33.33, 33.34, 33.33] },
      { amount: 250, type: "equal", payer: 1, offset: 45 },
      { amount: 500, type: "exact", payer: 2, offset: 50, exact: [200, 200, 100] },
      { amount: 1000.75, type: "equal", payer: 3, offset: 55 },
      { amount: 800, type: "percentage", payer: 1, offset: 58, pct: [50, 25, 25] },
    ];

    // Manali Trip (10 expenses)
    const manaliMembers = [4, 5, 6, 7];
    const manaliConfigs = [
      { amount: 5000, type: "equal", payer: 4, offset: 2 },
      { amount: 1200, type: "exact", payer: 5, offset: 6, exact: [300, 400, 250, 250] },
      { amount: 350.25, type: "equal", payer: 6, offset: 10 },
      { amount: 8000, type: "percentage", payer: 7, offset: 16, pct: [25, 25, 25, 25] },
      { amount: 450, type: "equal", payer: 4, offset: 22 },
      { amount: 670, type: "exact", payer: 5, offset: 30, exact: [100, 100, 200, 270] },
      { amount: 2100.8, type: "equal", payer: 6, offset: 38 },
      { amount: 1500, type: "percentage", payer: 7, offset: 42, pct: [30, 30, 20, 20] },
      { amount: 900, type: "equal", payer: 4, offset: 48 },
      { amount: 300, type: "exact", payer: 5, offset: 56, exact: [75, 75, 75, 75] },
    ];

    const generateExpenses = (groupId, memberIds, configs, descPrefix) => {
      configs.forEach((cfg, index) => {
        const expId = expenseIdCounter++;
        const totalCents = Math.round(cfg.amount * 100);

        expenses.push({
          id: expId,
          group_id: groupId,
          description: `${descPrefix} Expense ${index + 1}`,
          amount: cfg.amount,
          paid_by: cfg.payer,
          split_type: cfg.type,
          date: getDate(cfg.offset).toISOString().split('T')[0],
          created_at: new Date(),
          updated_at: new Date()
        });

        // Generate Splits exactly matching service logic
        if (cfg.type === "equal") {
          const splitAmounts = splitAmount(totalCents, memberIds.length);
          memberIds.forEach((mId, i) => {
            expenseSplits.push({
              id: splitIdCounter++,
              expense_id: expId,
              user_id: mId,
              amount_owed: (splitAmounts[i] / 100).toFixed(2),
              created_at: new Date(),
              updated_at: new Date()
            });
          });
        } else if (cfg.type === "exact") {
          memberIds.forEach((mId, i) => {
            expenseSplits.push({
              id: splitIdCounter++,
              expense_id: expId,
              user_id: mId,
              amount_owed: cfg.exact[i].toFixed(2),
              created_at: new Date(),
              updated_at: new Date()
            });
          });
        } else if (cfg.type === "percentage") {
          let sumCents = 0;
          const initialAmounts = cfg.pct.map(p => {
            const amt = Math.round((totalCents * p) / 100);
            sumCents += amt;
            return amt;
          });
          const remainder = totalCents - sumCents;
          const percentageAmounts = distributeRemainder(initialAmounts, remainder);
          memberIds.forEach((mId, i) => {
            expenseSplits.push({
              id: splitIdCounter++,
              expense_id: expId,
              user_id: mId,
              amount_owed: (percentageAmounts[i] / 100).toFixed(2),
              created_at: new Date(),
              updated_at: new Date()
            });
          });
        }
      });
    };

    generateExpenses(1, goaMembers, goaConfigs, "Goa");
    generateExpenses(2, manaliMembers, manaliConfigs, "Manali");

    await queryInterface.bulkInsert("expenses", expenses, {});
    await queryInterface.bulkInsert("expense_splits", expenseSplits, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("expense_splits", null, {});
    await queryInterface.bulkDelete("expenses", null, {});
    await queryInterface.bulkDelete("group_members", null, {});
    await queryInterface.bulkDelete("groups", null, {});
    await queryInterface.bulkDelete("users", null, {});
  }
};
