const {
  Expenses,
  Groups,
  Members,
  ExpenseSplits,
  Settlements,
  sequelize,
} = require("../models");

async function deleteExpense(expenseId) {
  const transaction = await sequelize.transaction();

  try {
    const expense = await Expenses.findByPk(expenseId, { transaction });
    if (!expense) {
      await transaction.rollback();
      throw { status: 404, message: "Expense not found" };
    }
    await expense.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { deleteExpense };
