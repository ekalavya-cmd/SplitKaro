module.exports = (sequelize, DataTypes) => {
  const ExpenseSplits = sequelize.define(
    "ExpenseSplits",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1,
        },
      },

      expenseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      memberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      amountOwed: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 0,
        },
      },
    },

    { tableName: "expense_splits", timestamps: true, underscored: true },
  );

  ExpenseSplits.associate = (models) => {
    ExpenseSplits.belongsTo(models.Expenses, {
      foreignKey: "expenseId",
      as: "expense",
      onDelete: "CASCADE",
    });
  };

  ExpenseSplits.associate = (models) => {
    ExpenseSplits.belongsTo(models.Members, {
      foreignKey: "memberId",
      as: "member",
      onDelete: "CASCADE",
    });
  };

  return ExpenseSplits;
};
