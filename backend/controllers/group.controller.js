const logger = require("../config/logger.config");
const {
  getGroups,
  getGroup,
  createGroup: createGroupService,
} = require("../services/group.service");

async function fetchGroups(req, res) {
  try {
    const groups = await getGroups(req.userId);
    res.status(200).json({ message: "Groups fetched successfully", groups });
  } catch (err) {
    logger.error("Error fetching groups:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function fetchGroup(req, res) {
  try {
    const group = await getGroup(req.params.id);
    res.status(200).json(group);
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    logger.error("Error fetching group:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function createGroup(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    const group = await createGroupService(userId, { name, description });

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (err) {
    if (err && err.status && err.message) {
      return res.status(err.status).json({ message: err.message });
    }

    logger.error("Error creating group:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}

module.exports = {
  fetchGroup,
  fetchGroups,
  createGroup,
};
