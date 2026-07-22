const {
  calculateGroupBalances,
  suggestSettlementForGroup,
  recordSettlementForGroup,
  getSettlementsForGroup,
  deleteSettlement,
} = require("../services/settlement.service");

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

module.exports = {
  fetchBalances,
  fetchSettlementSuggestions,
  recordSettlement,
  fetchSettlements,
  removeSettlement,
};
