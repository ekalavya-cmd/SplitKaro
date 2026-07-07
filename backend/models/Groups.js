module.exports = (sequelize, DataTypes) => {
  const Groups = sequelize.define(
    "Groups",
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

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },

    { tableName: "groups", timestamps: true, underscored: true },
  );

  Groups.associate = (models) => {
    Groups.hasMany(models.Members, {
      foreignKey: "groupId",
      as: "members",
    });

    Groups.hasMany(models.Expenses, {
      foreignKey: "groupId",
      as: "expenses",
    });

    Groups.hasMany(models.Settlements, {
      foreignKey: "groupId",
      as: "settlements",
    });
  };

  return Groups;
};
