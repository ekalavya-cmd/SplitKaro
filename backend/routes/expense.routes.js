const express = require("express");
const router = express.Router({ mergeParams: true });
const expenseController = require("../controllers/expense.controller");
const { authenticate } = require("../middleware/auth.middleware");
const {
  requireGroupMembership,
  requireExpenseGroupMembership,
} = require("../middleware/groupMembership.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createExpenseSchema } = require("../validators/expense.validators");

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
  validate(createExpenseSchema),
  expenseController.createExpense,
);
router.delete(
  "/:expenseId",
  authenticate,
  requireExpenseGroupMembership,
  expenseController.removeExpense,
);

module.exports = router;
