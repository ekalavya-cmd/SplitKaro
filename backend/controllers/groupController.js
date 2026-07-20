const logger = require("../config/logger.config");
const {
  getGroups,
  getGroup,
  createGroup: createGroupService,
  getGroupByInviteToken: getGroupByInviteTokenService,
  joinGroupViaInvite: joinGroupViaInviteService,
  createExpenseForGroup,
  getExpensesForGroup,
  calculateGroupBalances,
  suggestSettlementForGroup,
  recordSettlementForGroup,
  getSettlementsForGroup,
  deleteSettlement,
} = require("../services/groupService");

async function fetchGroups(req, res) {
  try {
    const groups = await getGroups(req.userId);
    res.status(200).json({ message: "Groups fetched successfully", groups });
  } catch (err) {
    logger.error("Error fetching groups:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function fetchGroup(req, res) {
  try {
    const group = await getGroup(req.params.id);
    res.status(200).json(group);
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("Error fetching group:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function createGroup(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    const group = await createGroupService(userId, { name, description });

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    logger.error("Error creating group:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function createExpense(req, res) {
  try {
    const groupId = req.params.id;
    const expenseData = req.body;

    const result = await createExpenseForGroup(groupId, expenseData);

    res.status(201).json({
      message: "Expense created successfully",
      expense: result.expense,
      splits: result.splits,
    });
  } catch (err) {
    console.error("Error creating expense:", err);

    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function fetchExpenses(req, res) {
  try {
    const groupId = req.params.id;
    const expenses = await getExpensesForGroup(groupId);

    res.status(200).json({
      message: "Expenses fetched successfully",
      expenses,
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);

    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function fetchBalances(req, res) {
  try {
    const groupId = req.params.id;
    const balances = await calculateGroupBalances(groupId);

    res.status(200).json({
      message: "Balances calculated successfully",
      balances,
    });
  } catch (err) {
    console.error("Error calculating balances:", err);

    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function fetchSettlementSuggestions(req, res) {
  try {
    const groupId = req.params.id;
    const suggestions = await suggestSettlementForGroup(groupId);

    res.status(200).json({
      message: "Settlement suggestions fetched successfully",
      suggestions,
    });
  } catch (err) {
    console.error("Error suggesting settlements:", err);

    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function recordSettlement(req, res) {
  try {
    const groupId = req.params.id;
    const settlementData = req.body;

    const result = await recordSettlementForGroup(groupId, settlementData);

    res.status(201).json({
      message: "Settlement recorded successfully",
      settlement: result,
    });
  } catch (err) {
    console.error("Error recording settlement:", err);

    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function fetchSettlements(req, res) {
  try {
    const groupId = req.params.id;
    const settlements = await getSettlementsForGroup(groupId);

    res.status(200).json({
      message: "Settlements fetched successfully",
      settlements,
    });
  } catch (err) {
    console.error("Error fetching settlements:", err);

    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function removeSettlement(req, res) {
  try {
    const settlementId = req.params.id;
    await deleteSettlement(settlementId);
    res.status(200).json({ message: "Settlement deleted successfully" });
  } catch (err) {
    console.error("Error deleting settlement:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getGroupByInviteToken(req, res) {
  try {
    const group = await getGroupByInviteTokenService(req.params.token);
    res.status(200).json(group);
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("Error fetching group by invite token:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function joinGroupViaInvite(req, res) {
  try {
    const result = await joinGroupViaInviteService(req.userId, req.params.token);
    res.status(200).json({
      message: "Successfully joined the group",
      group: result
    });
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("Error joining group via invite token:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  fetchGroup,
  fetchGroups,
  createGroup,
  getGroupByInviteToken,
  joinGroupViaInvite,
  createExpense,
  fetchExpenses,
  fetchBalances,
  fetchSettlementSuggestions,
  recordSettlement,
  fetchSettlements,
  removeSettlement,
};
