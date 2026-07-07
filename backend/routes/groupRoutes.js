const express = require("express");
const router = express.Router();
const groupcontroller = require("../controllers/groupController");

router.get("/", groupcontroller.fetchGroups);
router.get("/:id", groupcontroller.fetchGroup);
router.post("/", groupcontroller.createGroup);
router.get("/:id/expenses", groupcontroller.fetchExpenses);
router.get("/:id/balances", groupcontroller.fetchBalances);
router.post("/:id/expenses", groupcontroller.createExpense);
router.get(
  "/:id/settlements/suggest",
  groupcontroller.fetchSettlementSuggestions,
);
router.post("/:id/settlements", groupcontroller.recordSettlement);
router.get("/:id/settlements", groupcontroller.fetchSettlements);
router.delete("/settlements/:id", groupcontroller.removeSettlement);

module.exports = router;
