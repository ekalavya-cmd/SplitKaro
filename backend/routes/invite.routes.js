const express = require("express");
const router = express.Router();
const inviteController = require("../controllers/invite.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/:token", inviteController.getGroupByInviteToken);
router.post(
  "/:token/join",
  authenticate,
  inviteController.joinGroupViaInvite,
);

module.exports = router;
