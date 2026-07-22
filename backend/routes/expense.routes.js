const express = require("express");
const router = express.Router({ mergeParams: true });
const expenseController = require("../controllers/expense.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  requireGroupMembership,
  requireExpenseGroupMembership,
} = require("../middleware/groupMembership.middleware");

router.get(
  "/",
  authenticate,
  requireGroupMembership,
  expenseController.fetchExpenses,
);
router.post(
  "/",
  authenticate,
  requireGroupMembership,
  expenseController.createExpense,
);
router.delete(
  "/:expenseId",
  authenticate,
  requireExpenseGroupMembership,
  expenseController.removeExpense,
);

module.exports = router;
