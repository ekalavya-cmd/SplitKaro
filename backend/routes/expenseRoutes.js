const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

router.delete("/:id", expenseController.removeExpense);

module.exports = router;
