const express = require("express");
const router = express.Router();
const groupcontroller = require("../controllers/groupController");

router.get("/", groupcontroller.fetchGroups);
router.post("/", groupcontroller.createGroup);
router.delete("/settlements/:id", groupcontroller.removeSettlement);
router.get("/:id", groupcontroller.fetchGroup);
router.get("/:id/expenses", groupcontroller.fetchExpenses);
router.get("/:id/balances", groupcontroller.fetchBalances);
router.post("/:id/expenses", groupcontroller.createExpense);
router.get(
  "/:id/settlements/suggest",
  groupcontroller.fetchSettlementSuggestions,
);
router.post("/:id/settlements", groupcontroller.recordSettlement);
router.get("/:id/settlements", groupcontroller.fetchSettlements);

module.exports = router;
