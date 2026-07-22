const logger = require("../config/logger.config");
const {
  getGroupByInviteToken: getGroupByInviteTokenService,
  joinGroupViaInvite: joinGroupViaInviteService,
} = require("../services/invite.service");

async function getGroupByInviteToken(req, res) {
  try {
    const group = await getGroupByInviteTokenService(req.params.token);
    res.status(200).json(group);
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("Error fetching group by invite token:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

async function joinGroupViaInvite(req, res) {
  try {
    const result = await joinGroupViaInviteService(req.userId, req.params.token);
    res.status(200).json({
      message: "Successfully joined the group",
      group: result
    });
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("Error joining group via invite token:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  getGroupByInviteToken,
  joinGroupViaInvite,
};
