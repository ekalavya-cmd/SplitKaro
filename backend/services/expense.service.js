const logger = require("../config/logger.config");
const { splitAmount, distributeRemainder } = require("../utils/splitMath");
const { validateAndParseDate } = require("../utils/dateValidator");
const {
  Expenses,
  Groups,
  GroupMember,
  User,
  ExpenseSplits,
  Settlements,
  sequelize,
} = require("../models");

async function createExpenseForGroup(groupId, expenseData) {
  const { paid_by, amount, description, split_type, date, splits } =
    expenseData;

  if (!paid_by || !amount || !description || !split_type || !date) {
    throw {
      status: 400,
      message:
        "paid_by, amount, description, split_type, and date are required",
    };
  }

  if (
    split_type !== "equal" &&
    split_type !== "exact" &&
    split_type !== "percentage"
  ) {
    throw {
      status: 400,
      message: "split_type must be 'equal', 'exact', or 'percentage'",
    };
  }

  const group = await Groups.findByPk(groupId, {
    include: {
      model: User,
      as: "users",
      attributes: ["id", "name"],
      through: { attributes: [] },
    },
    order: [[{ model: User, as: "users" }, "id", "ASC"]],
  });

  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const users = group.users;
  if (!users || users.length === 0) {
    throw {
      status: 400,
      message: "Group must have members before adding expenses",
    };
  }

  const payerId = Number(paid_by);
  if (!users.some((user) => user.id === payerId)) {
    throw {
      status: 400,
      message: "paid_by must be a valid member of the group",
    };
  }

  const parsedDate = validateAndParseDate(date);

  const totalAmount = Math.round(Number(amount) * 100);
  if (totalAmount <= 0) {
    throw { status: 400, message: "Amount must be greater than 0" };
  }

  let splitsData;

  if (split_type === "equal") {
    const sharedAmount = splitAmount(totalAmount, users.length);
    splitsData = users.map((user, index) => ({
      expenseId: null,
      userId: user.id,
      amountOwed: (sharedAmount[index] / 100).toFixed(2),
    }));
  } else if (split_type === "exact") {
    if (!splits || typeof splits !== "object") {
      throw {
        status: 400,
        message: "splits object is required for exact split type",
      };
    }

    const userIds = users.map((user) => user.id);
    const splitUserIds = Object.keys(splits).map((id) => Number(id));

    const invalidUserIds = splitUserIds.filter(
      (id) => !userIds.includes(id),
    );
    if (invalidUserIds.length > 0) {
      throw {
        status: 400,
        message: `Invalid member IDs in splits: ${invalidUserIds.join(", ")}`,
      };
    }

    const missingUserIds = userIds.filter(
      (id) => !splitUserIds.includes(id),
    );
    if (missingUserIds.length > 0) {
      throw {
        status: 400,
        message: `Missing splits for member IDs: ${missingUserIds.join(", ")}`,
      };
    }

    const splitsTotal = Object.values(splits).reduce(
      (sum, value) => sum + Number(value),
      0,
    );

    if (Math.abs(splitsTotal - Number(amount)) > 0.01) {
      throw {
        status: 400,
        message: `Split amounts sum to ${splitsTotal}, but total amount is ${amount}`,
      };
    }

    splitsData = userIds.map((userId) => ({
      expenseId: null,
      userId,
      amountOwed: Number(splits[userId]).toFixed(2),
    }));
  } else if (split_type === "percentage") {
    if (!splits || typeof splits !== "object") {
      throw {
        status: 400,
        message: "splits object is required for percentage split type",
      };
    }

    const userIds = users.map((user) => user.id);
    const splitUserIds = Object.keys(splits).map((id) => Number(id));

    const invalidUserIds = splitUserIds.filter(
      (id) => !userIds.includes(id),
    );
    if (invalidUserIds.length > 0) {
      throw {
        status: 400,
        message: `Invalid member IDs in splits: ${invalidUserIds.join(", ")}`,
      };
    }

    const missingUserIds = userIds.filter(
      (id) => !splitUserIds.includes(id),
    );
    if (missingUserIds.length > 0) {
      throw {
        status: 400,
        message: `Missing splits for member IDs: ${missingUserIds.join(", ")}`,
      };
    }

    const percentagesTotal = Object.values(splits).reduce(
      (sum, value) => sum + Number(value),
      0,
    );

    if (Math.abs(percentagesTotal - 100) > 0.01) {
      throw {
        status: 400,
        message: `Percentages sum to ${percentagesTotal}, but must sum to exactly 100`,
      };
    }

    const initialAmounts = userIds.map((userId) => {
      const percentage = Number(splits[userId]);
      return Math.round((totalAmount * percentage) / 100);
    });

    const calculatedTotal = initialAmounts.reduce(
      (sum, amount) => sum + amount,
      0,
    );
    const remainder = totalAmount - calculatedTotal;

    // Array order is strictly determined by userIds (matching the DB insertion order of group.users),
    // bypassing JS object key sorting so remainder distribution perfectly matches the equal-split path.
    const percentageAmounts = distributeRemainder(initialAmounts, remainder);

    splitsData = userIds.map((userId, index) => ({
      expenseId: null,
      userId,
      amountOwed: (percentageAmounts[index] / 100).toFixed(2),
    }));
  }

  return await sequelize.transaction(async (transaction) => {
    const expense = await Expenses.create(
      {
        groupId,
        paidBy: payerId,
        amount,
        description,
        splitType: split_type,
        date: parsedDate,
      },
      { transaction },
    );

    splitsData.forEach((split) => {
      split.expenseId = expense.id;
    });

    await ExpenseSplits.bulkCreate(splitsData, { transaction });

    return {
      expense,
      splits: splitsData,
    };
  });
}

async function getExpensesForGroup(groupId) {
  const group = await Groups.findByPk(groupId);
  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const expenses = await Expenses.findAll({
    where: { groupId },
    attributes: [
      "id",
      "groupId",
      "paidBy",
      "amount",
      "description",
      "splitType",
      "date",
    ],
    include: [
      {
        model: User,
        as: "payer",
        attributes: ["name", "email"],
      },
      {
        model: ExpenseSplits,
        as: "splits",
        attributes: ["id", "userId", "amountOwed"],
        include: {
          model: User,
          as: "user",
          attributes: ["name", "email"],
        },
        separate: true,
        order: [["userId", "ASC"]],
      },
    ],
    order: [["id", "ASC"]],
  });

  logger.debug(`Fetched ${expenses.length} expenses for group id ${groupId}`);

  return expenses.map((expense) => ({
    id: expense.id,
    groupId: expense.groupId,
    paidBy: expense.paidBy,
    payer: expense.payer,
    amount: expense.amount,
    description: expense.description,
    splitType: expense.splitType,
    date: expense.date,
    splits: expense.splits.map((split) => ({
      id: split.id,
      userId: split.userId,
      user: split.user,
      amountOwed: split.amountOwed,
    })),
  }));
}
async function deleteExpense(expenseId) {
  const transaction = await sequelize.transaction();

  try {
    const expense = await Expenses.findByPk(expenseId, { transaction });
    if (!expense) {
      throw { status: 404, message: "Expense not found" };
    }
    await expense.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  createExpenseForGroup,
  getExpensesForGroup,
  deleteExpense,
};
