module.exports = (sequelize, DataTypes) => {
  const Settlements = sequelize.define(
    "Settlements",
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

      paidTo: {
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

      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: true,
        },
      },
    },

    { tableName: "settlements", timestamps: true, underscored: true },
  );

  Settlements.associate = (models) => {
    Settlements.belongsTo(models.Groups, {
      foreignKey: "groupId",
      as: "group",
      onDelete: "CASCADE",
    });

    Settlements.belongsTo(models.User, {
      foreignKey: "paidBy",
      as: "payer",
      onDelete: "RESTRICT",
    });

    Settlements.belongsTo(models.User, {
      foreignKey: "paidTo",
      as: "payee",
      onDelete: "RESTRICT",
    });
  };

  return Settlements;
};
