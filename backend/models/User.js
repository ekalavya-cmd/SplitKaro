module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
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

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },

      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },

    {
      tableName: "users",
      timestamps: true,
      underscored: true,
      validate: {
        // Model-level validation: user must have signed up via password OR Google
        mustHaveAuthMethod() {
          if (this.passwordHash === null && this.googleId === null) {
            throw new Error(
              "A user must have at least one authentication method (password_hash or google_id)."
            );
          }
        },
      },
    }
  );

  User.associate = (models) => {
    User.belongsToMany(models.Groups, {
      through: models.GroupMember,
      foreignKey: "userId",
      otherKey: "groupId",
      as: "groups",
    });
  };

  return User;
};