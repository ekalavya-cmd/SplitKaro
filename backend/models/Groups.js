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

      // FK → users.id — nullable so that deleting a user doesn't cascade-delete the group
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: true,
        },
      },

      // Shareable invite link token — unique per group
      inviteToken: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },

    { tableName: "groups", timestamps: true, underscored: true },
  );

  Groups.associate = (models) => {
    Groups.belongsToMany(models.User, {
      through: models.GroupMember,
      foreignKey: "groupId",
      otherKey: "userId",
      as: "users",
    });

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

    Groups.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });
  };

  return Groups;
};
