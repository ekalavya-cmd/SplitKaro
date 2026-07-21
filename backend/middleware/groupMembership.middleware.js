"use strict";

const { Groups, GroupMember, Expenses, Settlements } = require("../models");
const logger = require("../config/logger.config");

/**
 * Shared helper to check if a group exists and if a user is a member.
 * Throws { status, message } on failure so the caller can catch and return it.
 */
async function checkMembership(userId, groupId) {
  const group = await Groups.findByPk(groupId);
  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const member = await GroupMember.findOne({
    where: {
      userId,
      groupId
    }
  });

  if (!member) {
    throw { status: 403, message: "You are not a member of this group." };
  }

  return true;
}

async function requireGroupMembership(req, res, next) {
  const groupId = req.params.id;
  const userId = req.userId;

  try {
    await checkMembership(userId, groupId);
    logger.debug(`requireGroupMembership: User ${userId} is a member of group ${groupId}`);
    next();
  } catch (err) {
    if (err.status && err.message) {
      logger.debug(`requireGroupMembership: ${err.message}`);
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("requireGroupMembership: Unexpected error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function requireExpenseGroupMembership(req, res, next) {
  const expenseId = req.params.id;
  const userId = req.userId;

  try {
    const expense = await Expenses.findByPk(expenseId);
    if (!expense) {
      logger.debug(`requireExpenseGroupMembership: Expense ${expenseId} not found`);
      return res.status(404).json({ message: "Expense not found" });
    }

    await checkMembership(userId, expense.groupId);
    logger.debug(`requireExpenseGroupMembership: User ${userId} is a member of group ${expense.groupId} for expense ${expenseId}`);
    next();
  } catch (err) {
    if (err.status && err.message) {
      logger.debug(`requireExpenseGroupMembership: ${err.message}`);
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("requireExpenseGroupMembership: Unexpected error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function requireSettlementGroupMembership(req, res, next) {
  const settlementId = req.params.id;
  const userId = req.userId;

  try {
    const settlement = await Settlements.findByPk(settlementId);
    if (!settlement) {
      logger.debug(`requireSettlementGroupMembership: Settlement ${settlementId} not found`);
      return res.status(404).json({ message: "Settlement not found" });
    }

    await checkMembership(userId, settlement.groupId);
    logger.debug(`requireSettlementGroupMembership: User ${userId} is a member of group ${settlement.groupId} for settlement ${settlementId}`);
    next();
  } catch (err) {
    if (err.status && err.message) {
      logger.debug(`requireSettlementGroupMembership: ${err.message}`);
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("requireSettlementGroupMembership: Unexpected error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  requireGroupMembership,
  requireExpenseGroupMembership,
  requireSettlementGroupMembership
};
