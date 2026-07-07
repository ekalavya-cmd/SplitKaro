module.exports = (sequelize, DataTypes) => {
  const Expenses = sequelize.define(
    "Expenses",
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

      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      paidBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 0,
        },
      },

      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      splitType: {
        type: DataTypes.ENUM("equal", "exact", "percentage"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["equal", "exact", "percentage"]],
            msg: "Invalid split type",
          },
        },
      },

      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: true,
        },
      },
    },

    { tableName: "expenses", timestamps: true, underscored: true },
  );

  Expenses.associate = (models) => {
    Expenses.belongsTo(models.Groups, {
      foreignKey: "groupId",
      as: "group",
      onDelete: "CASCADE",
    });

    Expenses.belongsTo(models.Members, {
      foreignKey: "paidBy",
      as: "payer",
      onDelete: "CASCADE",
    });

    Expenses.hasMany(models.ExpenseSplits, {
      foreignKey: "expenseId",
      as: "splits",
    });
  };

  return Expenses;
};
