const {
  getGroups,
  getGroup,
  createGroupWithMembers,
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
    const groups = await getGroups();
    res.status(200).json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function fetchGroup(req, res) {
  try {
    const group = await getGroup(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (err) {
    console.error("Error fetching group:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function createGroup(req, res) {
  try {
    const { name, description, members } = req.body;

    if (!name || !members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        message:
          "Group name and at least one member is required, and members must be a non-empty array",
      });
    }

    for (const member of members) {
      if (!member.name || !member.email || !member.phone) {
        return res.status(400).json({
          message: "Each member must have name, email, and phone",
        });
      }
    }

    const groupData = { name, description };
    const membersData = members.map((member) => ({
      name: member.name,
      email: member.email,
      phone: member.phone,
    }));

    const result = await createGroupWithMembers(groupData, membersData);

    res.status(201).json({
      message: "Group created successfully",
      result,
    });
  } catch (err) {
    console.error("Error creating group:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "A member with this email already exists",
      });
    }

    res.status(500).json({ message: "Internal Server Error" });
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
    const settlements = await suggestSettlementForGroup(groupId);

    res.status(200).json(settlements);
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

module.exports = {
  fetchGroup,
  fetchGroups,
  createGroup,
  createExpense,
  fetchExpenses,
  fetchBalances,
  fetchSettlementSuggestions,
  recordSettlement,
  fetchSettlements,
  removeSettlement,
};
