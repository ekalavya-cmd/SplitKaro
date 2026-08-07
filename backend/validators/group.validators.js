const { z } = require("zod");

const createGroupSchema = z.object({
  name: z
    .string({ message: "Group name is required." })
    .trim()
    .min(1, "Group name is required."),
  description: z.string().optional(),
});

module.exports = {
  createGroupSchema,
};
