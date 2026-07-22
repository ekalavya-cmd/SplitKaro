const crypto = require("crypto");
const logger = require("../config/logger.config");
const {
  Groups,
  GroupMember,
  User,
  sequelize,
} = require("../models");


async function getGroups(userId) {
  return await Groups.findAll({
    attributes: ["id", "name", "description"],
    include: {
      model: User,
      as: "users",
      attributes: [],
      where: { id: userId },
      through: { attributes: [] },
    },
  });
}

async function getGroup(groupId) {
  const group = await Groups.findByPk(groupId, {
    attributes: ["id", "name", "description"],
    include: {
      model: User,
      as: "users",
      attributes: ["id", "name", "email"],
      through: { attributes: [] },
    },
    order: [[{ model: User, as: "users" }, "id", "ASC"]],
  });

  if (!group) {
    throw { status: 404, message: "Group not found" };
  }

  const result = {
    id: group.id,
    name: group.name,
    description: group.description,
    members: group.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
    })),
  };

  logger.debug(`Fetched group id ${groupId} with ${result.members.length} members`);

  return result;
}

async function createGroup(userId, { name, description }) {
  if (!name || name.trim() === "") {
    throw { status: 400, message: "Group name is required." };
  }

  const transaction = await sequelize.transaction();

  try {
    const inviteToken = crypto.randomBytes(20).toString("hex");

    const group = await Groups.create(
      {
        name,
        description,
        createdBy: userId,
        inviteToken,
      },
      { transaction }
    );

    await GroupMember.create(
      {
        userId,
        groupId: group.id,
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`Group created: groupId=${group.id}, createdBy=${userId}`);

    return group;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}


module.exports = {
  getGroups,
  getGroup,
  createGroup,
};
