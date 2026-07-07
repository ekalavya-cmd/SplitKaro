module.exports = (sequelize, DataTypes) => {
  const Members = sequelize.define(
    "Members",
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

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },

    { tableName: "members", timestamps: true, underscored: true },
  );

  Members.associate = (models) => {
    Members.belongsTo(models.Groups, {
      foreignKey: "groupId",
      as: "group",
      onDelete: "CASCADE",
    });

    Members.hasMany(models.Expenses, {
      foreignKey: "paidBy",
      as: "expensesPaid",
    });

    Members.hasMany(models.ExpenseSplits, {
      foreignKey: "memberId",
      as: "expenseSplits",
    });

    Members.hasMany(models.Settlements, {
      foreignKey: "paidBy",
      as: "settlementsPaid",
    });

    Members.hasMany(models.Settlements, {
      foreignKey: "paidTo",
      as: "settlementsReceived",
    });
  };

  return Members;
};
