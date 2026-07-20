"use strict";

const { Groups, GroupMember } = require("../models");
const logger = require("../config/logger.config");

async function requireGroupMembership(req, res, next) {
  const groupId = req.params.id;
  const userId = req.userId;

  try {
    const group = await Groups.findByPk(groupId);

    if (!group) {
      logger.debug(`requireGroupMembership: Group ${groupId} not found`);
      return res.status(404).json({ message: "Group not found" });
    }

    const member = await GroupMember.findOne({
      where: {
        userId,
        groupId
      }
    });

    if (!member) {
      logger.debug(`requireGroupMembership: User ${userId} is not a member of group ${groupId}`);
      return res.status(403).json({ message: "You are not a member of this group." });
    }

    logger.debug(`requireGroupMembership: User ${userId} is a member of group ${groupId}`);
    next();
  } catch (err) {
    logger.error("requireGroupMembership: Unexpected error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = { requireGroupMembership };
