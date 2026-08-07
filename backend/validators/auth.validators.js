const { z } = require("zod");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerSchema = z.object({
  name: z
    .string({ message: "Name is required." })
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string({ message: "A valid email address is required." })
    .trim()
    .regex(EMAIL_REGEX, "A valid email address is required."),
  password: z
    .string({ message: "Password is required." })
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

const loginSchema = z.object({
  email: z
    .string({ message: "Email is required." })
    .trim()
    .min(1, "Email is required."),
  password: z
    .string({ message: "Password is required." })
    .trim()
    .min(1, "Password is required."),
});

module.exports = {
  registerSchema,
  loginSchema,
};
