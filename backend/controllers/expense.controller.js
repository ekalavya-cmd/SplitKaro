const {
  createExpenseForGroup,
  getExpensesForGroup,
  deleteExpense,
} = require("../services/expense.service");

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

async function removeExpense(req, res) {
  try {
    const expenseId = req.params.expenseId;
    await deleteExpense(expenseId);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = {
  createExpense,
  fetchExpenses,
  removeExpense,
};
