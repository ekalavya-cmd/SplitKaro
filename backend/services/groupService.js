const {
  Expenses,
  Groups,
  Members,
  ExpenseSplits,
  Settlements,
  sequelize,
} = require("../models");

const { splitAmount } = require("../utils/equalSplitAmount");

async function getGroups() {
  return await Groups.findAll({
    attributes: ["id", "name", "description"],
  });
}

async function getGroup(groupId) {
  return await Groups.findByPk(groupId, {
    attributes: ["id", "name", "description"],
    include: {
      model: Members,
      as: "members",
      attributes: ["id", "name", "email", "phone"],
      separate: true,
      order: [["id", "ASC"]],
    },
  });
}

async function createGroupWithMembers(groupData, membersData) {
  const transaction = await sequelize.transaction();

  try {
    const group = await Groups.create(groupData, { transaction });

    const members = await Promise.all(
      membersData.map((memberData) =>
        Members.create({ ...memberData, groupId: group.id }, { transaction }),
      ),
    );

    await transaction.commit();

    return {
      group,
      members,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

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
      model: Members,
      as: "members",
      attributes: ["id", "name"],
      separate: true,
      order: [["id", "ASC"]],
    },
  });

  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const members = group.members;
  if (!members || members.length === 0) {
    throw {
      status: 400,
      message: "Group must have members before adding expenses",
    };
  }

  const payerId = Number(paid_by);
  if (!members.some((member) => member.id === payerId)) {
    throw {
      status: 400,
      message: "paid_by must be a valid member of the group",
    };
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw { status: 400, message: "Invalid date format" };
  }

  const totalAmount = Math.round(Number(amount) * 100);
  if (totalAmount <= 0) {
    throw { status: 400, message: "Amount must be greater than 0" };
  }

  let splitsData;

  if (split_type === "equal") {
    const sharedAmount = splitAmount(totalAmount, members.length);
    splitsData = members.map((member, index) => ({
      expenseId: null,
      memberId: member.id,
      amountOwed: (sharedAmount[index] / 100).toFixed(2),
    }));
  } else if (split_type === "exact") {
    if (!splits || typeof splits !== "object") {
      throw {
        status: 400,
        message: "splits object is required for exact split type",
      };
    }

    const memberIds = members.map((member) => member.id);
    const splitMemberIds = Object.keys(splits).map((id) => Number(id));

    const invalidMemberIds = splitMemberIds.filter(
      (id) => !memberIds.includes(id),
    );
    if (invalidMemberIds.length > 0) {
      throw {
        status: 400,
        message: `Invalid member IDs in splits: ${invalidMemberIds.join(", ")}`,
      };
    }

    const missingMemberIds = memberIds.filter(
      (id) => !splitMemberIds.includes(id),
    );
    if (missingMemberIds.length > 0) {
      throw {
        status: 400,
        message: `Missing splits for member IDs: ${missingMemberIds.join(", ")}`,
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

    splitsData = memberIds.map((memberId) => ({
      expenseId: null,
      memberId,
      amountOwed: Number(splits[memberId]).toFixed(2),
    }));
  } else if (split_type === "percentage") {
    if (!splits || typeof splits !== "object") {
      throw {
        status: 400,
        message: "splits object is required for percentage split type",
      };
    }

    const memberIds = members.map((member) => member.id);
    const splitMemberIds = Object.keys(splits).map((id) => Number(id));

    const invalidMemberIds = splitMemberIds.filter(
      (id) => !memberIds.includes(id),
    );
    if (invalidMemberIds.length > 0) {
      throw {
        status: 400,
        message: `Invalid member IDs in splits: ${invalidMemberIds.join(", ")}`,
      };
    }

    const missingMemberIds = memberIds.filter(
      (id) => !splitMemberIds.includes(id),
    );
    if (missingMemberIds.length > 0) {
      throw {
        status: 400,
        message: `Missing splits for member IDs: ${missingMemberIds.join(", ")}`,
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

    const percentageAmounts = memberIds.map((memberId) => {
      const percentage = Number(splits[memberId]);
      return Math.round((totalAmount * percentage) / 100);
    });

    const calculatedTotal = percentageAmounts.reduce(
      (sum, amount) => sum + amount,
      0,
    );
    const remainder = totalAmount - calculatedTotal;

    for (let i = 0; i < Math.abs(remainder); i++) {
      if (remainder > 0) {
        percentageAmounts[i]++;
      } else {
        percentageAmounts[i]--;
      }
    }

    splitsData = memberIds.map((memberId, index) => ({
      expenseId: null,
      memberId,
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
        model: Members,
        as: "payer",
        attributes: ["name", "email"],
      },
      {
        model: ExpenseSplits,
        as: "splits",
        attributes: ["id", "memberId", "amountOwed"],
        include: {
          model: Members,
          as: "member",
          attributes: ["name", "email"],
        },
        separate: true,
        order: [["memberId", "ASC"]],
      },
    ],
    order: [["id", "ASC"]],
  });

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
      memberId: split.memberId,
      member: split.member,
      amountOwed: split.amountOwed,
    })),
  }));
}

async function calculateGroupBalances(groupId) {
  const group = await Groups.findByPk(groupId, {
    include: {
      model: Members,
      as: "members",
      attributes: ["id", "name"],
      separate: true,
      order: [["id", "ASC"]],
    },
  });

  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const members = group.members;
  if (!members || members.length === 0) {
    throw { status: 400, message: "Group must have members" };
  }

  const expenses = await Expenses.findAll({
    where: { groupId },
    attributes: ["id", "paidBy", "amount"],
    include: [
      {
        model: ExpenseSplits,
        as: "splits",
        attributes: ["memberId", "amountOwed"],
        separate: true,
      },
    ],
  });

  const settlements = await Settlements.findAll({
    where: { groupId },
    attributes: ["paidBy", "paidTo", "amount"],
  });

  const balances = new Map();
  members.forEach((member) => {
    balances.set(member.id, {
      member_id: member.id,
      name: member.name,
      total_paid: 0,
      total_owed: 0,
      settlements_received: 0,
      settlements_paid: 0,
      balance: 0,
    });
  });

  expenses.forEach((expense) => {
    const paidBy = expense.paidBy;
    const amount = parseFloat(expense.amount);

    if (balances.has(paidBy)) {
      balances.get(paidBy).total_paid += amount;
    }

    expense.splits.forEach((split) => {
      const memberId = split.memberId;
      const amountOwed = parseFloat(split.amountOwed);

      if (balances.has(memberId)) {
        balances.get(memberId).total_owed += amountOwed;
      }
    });
  });

  settlements.forEach((settlement) => {
    const paidBy = settlement.paidBy;
    const paidTo = settlement.paidTo;
    const amount = parseFloat(settlement.amount);

    if (balances.has(paidBy)) {
      balances.get(paidBy).settlements_paid += amount;
    }

    if (balances.has(paidTo)) {
      balances.get(paidTo).settlements_received += amount;
    }
  });

  const result = Array.from(balances.values()).map((member) => {
    member.balance =
      Math.round(
        (member.total_paid -
          member.total_owed -
          member.settlements_received +
          member.settlements_paid) *
          100,
      ) / 100;
    return {
      member_id: member.member_id,
      name: member.name,
      balance: member.balance,
    };
  });

  const totalBalance = result.reduce((sum, member) => sum + member.balance, 0);
  const roundedTotal = Math.round(totalBalance * 100) / 100;

  if (Math.abs(roundedTotal) > 0.01) {
    throw {
      status: 500,
      message: `Balance calculation error: sum of balances (${roundedTotal}) does not equal zero. This indicates a bug in the calculation logic.`,
    };
  }

  return result;
}

async function suggestSettlementForGroup(groupId) {
  const balances = await calculateGroupBalances(groupId);

  const creditors = balances
    .filter((member) => member.balance > 0)
    .map((member) => ({
      ...member,
      remaining: Math.round(member.balance * 100) / 100,
    }))
    .sort((a, b) => b.remaining - a.remaining);

  const debtors = balances
    .filter((member) => member.balance < 0)
    .map((member) => ({
      ...member,
      remaining: Math.round(member.balance * 100) / 100,
    }))
    .sort((a, b) => a.remaining - b.remaining);

  const settlements = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(creditor.remaining, Math.abs(debtor.remaining));

    if (amount <= 0) {
      break;
    }

    const roundedAmount = Math.round(amount * 100) / 100;

    settlements.push({
      from: {
        id: debtor.member_id,
        name: debtor.name,
      },
      to: {
        id: creditor.member_id,
        name: creditor.name,
      },
      amount: roundedAmount,
    });

    creditor.remaining =
      Math.round((creditor.remaining - roundedAmount) * 100) / 100;
    debtor.remaining =
      Math.round((debtor.remaining + roundedAmount) * 100) / 100;

    if (Math.abs(creditor.remaining) < 0.01) {
      creditorIndex += 1;
    }

    if (Math.abs(debtor.remaining) < 0.01) {
      debtorIndex += 1;
    }
  }

  return settlements;
}

async function recordSettlementForGroup(groupId, settlementData) {
  const { paid_by, paid_to, amount, date } = settlementData;

  if (!paid_by || !paid_to || !amount) {
    throw {
      status: 400,
      message: "paid_by, paid_to, and amount are required",
    };
  }

  if (paid_by === paid_to) {
    throw {
      status: 400,
      message: "Cannot record settlement to yourself",
    };
  }

  const group = await Groups.findByPk(groupId, {
    include: {
      model: Members,
      as: "members",
      attributes: ["id", "name"],
      separate: true,
      order: [["id", "ASC"]],
    },
  });

  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const members = group.members;
  if (!members || members.length === 0) {
    throw {
      status: 400,
      message: "Group must have members before recording settlements",
    };
  }

  const payerId = Number(paid_by);
  const payeeId = Number(paid_to);

  if (!members.some((member) => member.id === payerId)) {
    throw {
      status: 400,
      message: "paid_by must be a valid member of the group",
    };
  }

  if (!members.some((member) => member.id === payeeId)) {
    throw {
      status: 400,
      message: "paid_to must be a valid member of the group",
    };
  }

  const parsedAmount = Math.round(Number(amount) * 100);
  if (parsedAmount <= 0) {
    throw { status: 400, message: "Amount must be greater than 0" };
  }

  const parsedDate = date ? new Date(date) : new Date();
  if (Number.isNaN(parsedDate.getTime())) {
    throw { status: 400, message: "Invalid date format" };
  }

  const balances = await calculateGroupBalances(groupId);
  const payerBalance = balances.find(
    (balance) => balance.member_id === payerId,
  );
  const payeeBalance = balances.find(
    (balance) => balance.member_id === payeeId,
  );

  if (!payerBalance || !payeeBalance) {
    throw { status: 500, message: "Error calculating balances" };
  }

  if (payerBalance.balance >= 0) {
    throw {
      status: 400,
      message: `${payerBalance.name} does not owe any money`,
    };
  }

  if (payeeBalance.balance <= 0) {
    throw {
      status: 400,
      message: `${payeeBalance.name} is not owed any money`,
    };
  }

  const maxAmount = Math.min(
    Math.abs(payerBalance.balance),
    payeeBalance.balance,
  );

  if (parsedAmount / 100 > maxAmount) {
    throw {
      status: 400,
      message: `Amount cannot exceed ₹${maxAmount.toFixed(2)} (what ${payerBalance.name} owes ${payeeBalance.name})`,
    };
  }

  const settlement = await Settlements.create({
    groupId,
    paidBy: payerId,
    paidTo: payeeId,
    amount: (parsedAmount / 100).toFixed(2),
    date: parsedDate,
  });

  return settlement;
}

async function getSettlementsForGroup(groupId) {
  const group = await Groups.findByPk(groupId);
  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const settlements = await Settlements.findAll({
    where: { groupId },
    attributes: ["id", "groupId", "paidBy", "paidTo", "amount", "date"],
    include: [
      {
        model: Members,
        as: "payer",
        attributes: ["name", "email"],
      },
      {
        model: Members,
        as: "payee",
        attributes: ["name", "email"],
      },
    ],
    order: [["id", "ASC"]],
  });

  return settlements.map((settlement) => ({
    id: settlement.id,
    groupId: settlement.groupId,
    paidBy: settlement.paidBy,
    paidTo: settlement.paidTo,
    payer: settlement.payer,
    payee: settlement.payee,
    amount: settlement.amount,
    date: settlement.date,
  }));
}

async function deleteSettlement(settlementId) {
  const transaction = await sequelize.transaction();

  try {
    const settlement = await Settlements.findByPk(settlementId, {
      transaction,
    });
    await settlement.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  getGroups,
  getGroup,
  createGroupWithMembers,
  createExpenseForGroup,
  getExpensesForGroup,
  calculateGroupBalances,
  suggestSettlementForGroup,
  recordSettlementForGroup,
  getSettlementsForGroup,
  deleteSettlement,
};
