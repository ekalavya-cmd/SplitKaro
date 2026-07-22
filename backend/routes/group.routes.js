const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireGroupMembership } = require("../middleware/groupMembership.middleware");

const inviteRouter = require("./invite.routes");
const settlementRouter = require("./settlement.routes");
const expenseRouter = require("./expense.routes");

// 1. Static and flat routes / mounts
router.get("/", authenticate, groupController.fetchGroups);
router.post("/", authenticate, groupController.createGroup);
router.use("/invite", inviteRouter);

// 2. Mixin routes (must precede the generic /:id catch-all)
router.use("/", settlementRouter); // Defines DELETE /settlements/:id, GET /:id/balances, etc.

// 3. Nested routes (safe to place here as they match /:id/...)
router.use("/:id/expenses", expenseRouter);

// 4. Catch-all generic group routes (MUST GO LAST)
router.get("/:id", authenticate, requireGroupMembership, groupController.fetchGroup);

module.exports = router;
