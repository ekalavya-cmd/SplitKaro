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

      // Renamed from member_id — DB column is now user_id (underscored: true handles the mapping)
      userId: {
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

    {
      tableName: "expense_splits",
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["expenseId", "userId"],
        },
      ],
    },
  );

  ExpenseSplits.associate = (models) => {
    ExpenseSplits.belongsTo(models.Expenses, {
      foreignKey: "expenseId",
      as: "expense",
      onDelete: "CASCADE",
    });

    ExpenseSplits.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "RESTRICT",
    });
  };

  return ExpenseSplits;
};
