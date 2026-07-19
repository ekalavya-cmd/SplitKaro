module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define(
    "GroupMember",
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

      // FK → users.id
      // Composite uniqueness (user_id, group_id) is enforced at the DB level via the
      // migration's addIndex("group_members", ["user_id", "group_id"], { unique: true })
      // — Sequelize model definitions do not enforce composite uniqueness directly.
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      // FK → groups.id
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
        },
      },

      joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },

    {
      tableName: "group_members",
      timestamps: true,
      underscored: true,
    }
  );

  GroupMember.associate = (models) => {
    GroupMember.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    GroupMember.belongsTo(models.Groups, {
      foreignKey: "groupId",
      as: "group",
    });
  };

  return GroupMember;
};