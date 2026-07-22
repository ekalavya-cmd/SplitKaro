const logger = require("../config/logger.config");
const { Groups, GroupMember } = require("../models");

async function getGroupByInviteToken(token) {
  logger.debug(`Looking up group by invite token...`);
  const group = await Groups.findOne({
    where: { inviteToken: token },
  });

  if (!group) {
    throw { status: 404, message: "Invalid or expired invite link." };
  }

  const memberCount = await GroupMember.count({
    where: { groupId: group.id },
  });

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    memberCount,
  };
}

async function joinGroupViaInvite(userId, token) {
  const group = await Groups.findOne({
    where: { inviteToken: token },
  });

  if (!group) {
    throw { status: 404, message: "Invalid or expired invite link." };
  }

  const existingMember = await GroupMember.findOne({
    where: {
      userId,
      groupId: group.id,
    },
  });

  if (existingMember) {
    throw { status: 409, message: "You are already a member of this group." };
  }

  await GroupMember.create({
    userId,
    groupId: group.id,
  });

  logger.info(`User ${userId} joined group ${group.id} via invite link`);

  return {
    id: group.id,
    name: group.name,
    description: group.description,
  };
}

module.exports = {
  getGroupByInviteToken,
  joinGroupViaInvite,
};
