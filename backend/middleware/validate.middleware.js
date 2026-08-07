const logger = require("../config/logger.config");

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Return the first issue's message to strictly match the legacy validation behavior
    const firstIssue = result.error.issues[0];
    logger.debug(`Validation failed: ${firstIssue.message}`);
    return res.status(400).json({ message: firstIssue.message });
  }

  // Update req.body with the sanitized/parsed data
  req.body = result.data;
  next();
};

module.exports = {
  validate,
};
