const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const { authenticate } = require("../middleware/auth.middleware");
const { requireExpenseGroupMembership } = require("../middleware/groupMembership.middleware");

router.delete("/:id", authenticate, requireExpenseGroupMembership, expenseController.removeExpense);

module.exports = router;
