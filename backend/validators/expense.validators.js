const { z } = require("zod");

const createExpenseSchema = z
  .object({
    paid_by: z.any().optional(),
    amount: z.any().optional(),
    description: z.any().optional(),
    split_type: z.any().optional(),
    date: z.any().optional(), // Date format validation remains in the service
    splits: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    // 1. Missing fields check
    if (!data.paid_by || !data.amount || !data.description || !data.split_type || !data.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "paid_by, amount, description, split_type, and date are required",
      });
      return; // Stop further validation if fields are missing
    }

    if (data.description && String(data.description).length > 255) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description must be 255 characters or less",
      });
    }

    // 2. Enum check for split_type
    if (
      data.split_type !== "equal" &&
      data.split_type !== "exact" &&
      data.split_type !== "percentage"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "split_type must be 'equal', 'exact', or 'percentage'",
      });
    }

    // 3. Amount check
    const amountNum = Number(data.amount);
    const totalAmount = Math.round(amountNum * 100);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than 0",
      });
    }

    // 4. Exact / Percentage specific checks
    if (data.split_type === "exact") {
      if (!data.splits || typeof data.splits !== "object" || Array.isArray(data.splits)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "splits object is required for exact split type",
        });
      } else {
        const splitsTotal = Object.values(data.splits).reduce(
          (sum, value) => sum + Number(value),
          0
        );

        if (Math.round(splitsTotal * 100) !== Math.round(amountNum * 100)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Split amounts sum to ${splitsTotal}, but total amount is ${data.amount}`,
          });
        }
      }
    } else if (data.split_type === "percentage") {
      if (!data.splits || typeof data.splits !== "object" || Array.isArray(data.splits)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "splits object is required for percentage split type",
        });
      } else {
        const percentagesTotal = Object.values(data.splits).reduce(
          (sum, value) => sum + Number(value),
          0
        );

        if (Math.round(percentagesTotal * 100) !== 10000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Percentages sum to ${percentagesTotal}, but must sum to exactly 100`,
          });
        }
      }
    }
  });

module.exports = {
  createExpenseSchema,
  updateExpenseSchema: createExpenseSchema,
};
