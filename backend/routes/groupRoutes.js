const express = require("express");
const router = express.Router();
const groupcontroller = require("../controllers/groupController");
const { authenticate } = require("../middleware/auth.middleware");
const { requireGroupMembership } = require("../middleware/groupMembership.middleware");

router.get("/", authenticate, groupcontroller.fetchGroups);
router.post("/", authenticate, groupcontroller.createGroup);
router.delete("/settlements/:id", groupcontroller.removeSettlement);
router.get("/invite/:token", groupcontroller.getGroupByInviteToken);
router.post("/invite/:token/join", authenticate, groupcontroller.joinGroupViaInvite);
router.get("/:id", authenticate, requireGroupMembership, groupcontroller.fetchGroup);
router.get("/:id/expenses", authenticate, requireGroupMembership, groupcontroller.fetchExpenses);
router.get("/:id/balances", authenticate, requireGroupMembership, groupcontroller.fetchBalances);
router.post("/:id/expenses", authenticate, requireGroupMembership, groupcontroller.createExpense);
router.get(
  "/:id/settlements/suggest",
  authenticate,
  requireGroupMembership,
  groupcontroller.fetchSettlementSuggestions,
);
router.post("/:id/settlements", authenticate, requireGroupMembership, groupcontroller.recordSettlement);
router.get("/:id/settlements", authenticate, requireGroupMembership, groupcontroller.fetchSettlements);

module.exports = router;
