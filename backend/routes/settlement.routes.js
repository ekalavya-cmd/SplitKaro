const express = require("express");
const router = express.Router();
const settlementController = require("../controllers/settlement.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  requireGroupMembership,
  requireSettlementGroupMembership,
} = require("../middleware/groupMembership.middleware");
const { validate } = require("../middleware/validate.middleware");
const { recordSettlementSchema } = require("../validators/settlement.validators");

router.delete(
  "/settlements/:id",
  authenticate,
  requireSettlementGroupMembership,
  settlementController.removeSettlement,
);
router.get(
  "/:id/balances",
  authenticate,
  requireGroupMembership,
  settlementController.fetchBalances,
);
router.get(
  "/:id/settlements/suggest",
  authenticate,
  requireGroupMembership,
  settlementController.fetchSettlementSuggestions,
);
router.post(
  "/:id/settlements",
  authenticate,
  requireGroupMembership,
  validate(recordSettlementSchema),
  settlementController.recordSettlement,
);
router.get(
  "/:id/settlements",
  authenticate,
  requireGroupMembership,
  settlementController.fetchSettlements,
);

module.exports = router;
