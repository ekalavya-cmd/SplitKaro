const { z } = require("zod");

const recordSettlementSchema = z
  .object({
    paid_by: z.any().optional(),
    paid_to: z.any().optional(),
    amount: z.any().optional(),
    date: z.any().optional(), // Just pass it through, format validation is in service
  })
  .superRefine((data, ctx) => {
    // 1. Missing fields check
    if (!data.paid_by || !data.paid_to || !data.amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "paid_by, paid_to, and amount are required",
      });
      return; // Stop further validation if fields are missing to avoid confusing errors
    }

    // 2. Type checks now that we know they exist
    const amountNum = Number(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Amount must be greater than 0",
      });
    }

    // 3. Self-payment check
    if (String(data.paid_by) === String(data.paid_to)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cannot record settlement to yourself",
      });
    }
  });

module.exports = {
  recordSettlementSchema,
};
