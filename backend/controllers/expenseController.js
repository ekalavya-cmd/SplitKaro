const { deleteExpense } = require("../services/expenseService");

async function removeExpense(req, res) {
  try {
    const expenseId = req.params.id;
    await deleteExpense(expenseId);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { removeExpense };
