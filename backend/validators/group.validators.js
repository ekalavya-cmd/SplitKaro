const { z } = require("zod");

const createGroupSchema = z.object({
  name: z
    .string({ message: "Group name is required." })
    .trim()
    .min(1, "Group name is required.")
    .max(255, "Group name must be 255 characters or less"),
  description: z.string().max(255, "Group description must be 255 characters or less").optional(),
});

module.exports = {
  createGroupSchema,
};
