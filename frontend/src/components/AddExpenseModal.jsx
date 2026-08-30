import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useCreateExpense } from "../mutations/useExpenseMutations";
import { Skeleton } from "./Skeleton";
import { Modal } from "./Modal";

// ---------------------------------------------------------------------------
// Schema — mirrors backend expense.service.js tolerances exactly:
//   Exact:      Math.abs(splitsTotal - amount) > 0.01
//   Percentage: Math.abs(percentagesTotal - 100) > 0.01
// ---------------------------------------------------------------------------
const expenseSchema = z
  .object({
    description: z
      .string()
      .min(1, "Description is required")
      .max(255, "Description must be 255 characters or less"),
    amount: z.coerce
      .number({ invalid_type_error: "Amount is required" })
      .positive("Amount must be greater than 0"),
    paid_by: z.string().min(1, "Payer is required"),
    split_type: z.enum(["equal", "exact", "percentage"]),
    date: z.string().min(1, "Date is required"),
    // splits is managed via setValue; Zod validates the computed totals
    splits: z.record(z.string(), z.number()).optional().default({}),
  })
  .superRefine((data, ctx) => {
    const splits = data.splits ?? {};
    const splitValues = Object.values(splits);

    if (data.split_type === "exact") {
      const sum = splitValues.reduce((acc, v) => acc + (Number(v) || 0), 0);
      if (Math.round(sum * 100) !== Math.round(data.amount * 100)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["splits"],
          message: `Split amounts must sum to ₹${data.amount.toFixed(2)} (currently ₹${sum.toFixed(2)})`,
        });
      }
    }

    if (data.split_type === "percentage") {
      const sum = splitValues.reduce((acc, v) => acc + (Number(v) || 0), 0);
      if (Math.round(sum * 100) !== 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["splits"],
          message: `Percentages must sum to 100% (currently ${sum.toFixed(2)}%)`,
        });
      }
    }
  });

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------
const fieldBorder = (hasError) =>
  hasError ? "border-error" : "border-outline-variant";

const baseInputClass =
  "h-10 w-full rounded-lg border bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

const fieldErrorClass = "mt-1 font-label-sm text-label-sm text-error";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const AddExpenseModal = ({ isOpen, onClose, groupId }) => {
  // Tab-memory: keep per-tab split values independent of RHF
  const [exactSplits, setExactSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      paid_by: "",
      split_type: "equal",
      date: new Date().toISOString().split("T")[0],
      splits: {},
    },
  });

  const splitType = useWatch({ control, name: "split_type" });
  const amount = useWatch({ control, name: "amount" });
  const descriptionValue = useWatch({ control, name: "description" });

  // Reset on close (render-phase pattern to avoid setState-in-effect lint)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      reset();
      setExactSplits({});
      setPercentageSplits({});
    }
  }

  const groupQuery = useGroupQuery(groupId, { enabled: !!groupId && isOpen });
  const group = groupQuery.data;

  const createExpenseMutation = useCreateExpense({
    onSuccess: () => {
      reset();
      setExactSplits({});
      setPercentageSplits({});
      onClose();
    },
  });

  // Handle split input change — updates tab-memory AND syncs value into RHF
  const handleSplitChange = (memberId, value, currentSplitType) => {
    const numValue = Number(value) || 0;

    if (currentSplitType === "exact") {
      setExactSplits((prev) => {
        const next = { ...prev, [memberId]: numValue };
        setValue("splits", next, { shouldValidate: false });
        return next;
      });
    } else if (currentSplitType === "percentage") {
      setPercentageSplits((prev) => {
        const next = { ...prev, [memberId]: numValue };
        setValue("splits", next, { shouldValidate: false });
        return next;
      });
    }
  };

  // Switch tab — restore stored values for the target tab
  const handleTabSwitch = (type) => {
    let restoredSplits = {};
    if (type === "exact") restoredSplits = exactSplits;
    if (type === "percentage") restoredSplits = percentageSplits;
    setValue("split_type", type, { shouldValidate: false });
    setValue("splits", restoredSplits, { shouldValidate: false });
  };

  const onSubmit = (data) => {
    createExpenseMutation.mutate({ groupId, inputs: data });
  };

  // Split values to display for the active tab
  const currentSplits =
    splitType === "exact"
      ? exactSplits
      : splitType === "percentage"
        ? percentageSplits
        : {};

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="hover:bg-surface-variant/50 rounded-lg px-5 py-2.5 font-body-md text-body-md font-semibold text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="add-expense-form"
        disabled={createExpenseMutation.isPending}
        className="rounded-lg bg-primary px-5 py-2.5 font-body-md text-body-md font-semibold text-on-primary shadow-sm transition-all outline-none hover:bg-primary/90 focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
      >
        {createExpenseMutation.isPending ? "Saving..." : "Save Expense"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Expense"
      footer={footer}
    >
      <form
        id="add-expense-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* Description */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="description"
              className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
            >
              Description
            </label>
            {descriptionValue?.length > 200 && (
              <span
                className={`font-label-sm text-[10px] font-semibold tracking-wider uppercase ${
                  descriptionValue.length > 255
                    ? "text-error"
                    : "text-on-surface-variant"
                }`}
              >
                {descriptionValue.length} / 255
              </span>
            )}
          </div>
          <input
            type="text"
            id="description"
            placeholder="Enter description"
            {...register("description")}
            className={`${baseInputClass} ${fieldBorder(!!errors.description)}`}
          />
          {errors.description && (
            <p className={fieldErrorClass}>{errors.description.message}</p>
          )}
        </div>

        {/* Amount + Paid By */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
            >
              Total Amount
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono-data text-on-surface-variant">
                ₹
              </span>
              <input
                type="number"
                id="amount"
                placeholder="0.00"
                step="0.01"
                {...register("amount")}
                className={`h-10 w-full rounded-lg border ${fieldBorder(!!errors.amount)} bg-surface-container-lowest pr-4 pl-8 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
              />
            </div>
            {errors.amount && (
              <p className={fieldErrorClass}>{errors.amount.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="paid_by"
              className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
            >
              Paid By
            </label>
            <select
              id="paid_by"
              {...register("paid_by")}
              className={`h-10 w-full cursor-pointer rounded-lg border ${fieldBorder(!!errors.paid_by)} bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
            >
              <option value="" disabled>
                Select Payer
              </option>
              {groupQuery.isLoading ? (
                <option value="" disabled>
                  Loading...
                </option>
              ) : group && group.members && group.members.length > 0 ? (
                group.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No members available
                </option>
              )}
            </select>
            {errors.paid_by && (
              <p className={fieldErrorClass}>{errors.paid_by.message}</p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex flex-col">
          <label
            htmlFor="date"
            className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register("date")}
            className={`${baseInputClass} cursor-pointer ${fieldBorder(!!errors.date)}`}
          />
          {errors.date && (
            <p className={fieldErrorClass}>{errors.date.message}</p>
          )}
        </div>

        {/* Split Options */}
        <div className="flex flex-col">
          <label className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            Split Options
          </label>
          <div className="mb-4 flex border-b border-outline-variant">
            {["equal", "exact", "percentage"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTabSwitch(type)}
                className={`px-4 py-2 font-label-sm tracking-wider uppercase transition-colors ${
                  splitType === type
                    ? "border-b-2 border-primary font-bold text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            {/* ── Exact ── */}
            {splitType === "exact" && (
              <div className="flex flex-col gap-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Enter the exact amount each person owes:
                </p>
                {groupQuery.isLoading ? (
                  <div className="flex min-h-30 flex-col gap-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ) : group && group.members && group.members.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <label
                          htmlFor={`split-${member.id}`}
                          className="font-body-md text-body-md font-medium text-on-surface"
                        >
                          {member.name}
                        </label>
                        <div className="relative">
                          <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono-data text-on-surface-variant">
                            ₹
                          </span>
                          <input
                            type="number"
                            id={`split-${member.id}`}
                            value={currentSplits[member.id] ?? ""}
                            onChange={(e) =>
                              handleSplitChange(
                                member.id,
                                e.target.value,
                                "exact",
                              )
                            }
                            placeholder="0.00"
                            step="0.01"
                            className="h-10 w-32 rounded-lg border border-outline-variant bg-surface-container-lowest pr-4 pl-8 text-right font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    No members available.
                  </p>
                )}
                {Object.keys(currentSplits).length > 0 && (
                  <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-4 font-label-sm text-label-sm font-bold text-on-surface">
                    <span className="tracking-wider uppercase">
                      Total Allocated
                    </span>
                    <span className="font-mono-data text-body-lg text-secondary">
                      ₹{" "}
                      {Object.values(currentSplits)
                        .reduce((sum, val) => sum + (Number(val) || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                )}
                {errors.splits && (
                  <p className={fieldErrorClass}>{errors.splits.message}</p>
                )}
              </div>
            )}

            {/* ── Percentage ── */}
            {splitType === "percentage" && (
              <div className="flex flex-col gap-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Enter the percentage each person owes (must sum to 100%):
                </p>
                {groupQuery.isLoading ? (
                  <div className="flex min-h-30 flex-col gap-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ) : group && group.members && group.members.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <label
                          htmlFor={`split-${member.id}`}
                          className="font-body-md text-body-md font-medium text-on-surface"
                        >
                          {member.name}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id={`split-${member.id}`}
                            value={currentSplits[member.id] ?? ""}
                            onChange={(e) =>
                              handleSplitChange(
                                member.id,
                                e.target.value,
                                "percentage",
                              )
                            }
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                            className="h-10 w-32 rounded-lg border border-outline-variant bg-surface-container-lowest pr-8 pl-4 text-right font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          />
                          <span className="absolute top-1/2 right-3 -translate-y-1/2 font-mono-data text-on-surface-variant">
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    No members available.
                  </p>
                )}
                {Object.keys(currentSplits).length > 0 && (
                  <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-4 font-label-sm text-label-sm font-bold text-on-surface">
                    <span className="tracking-wider uppercase">
                      Total Percentage
                    </span>
                    <span className="font-mono-data text-body-lg text-secondary">
                      {Object.values(currentSplits)
                        .reduce((sum, val) => sum + (Number(val) || 0), 0)
                        .toFixed(2)}{" "}
                      %
                    </span>
                  </div>
                )}
                {errors.splits && (
                  <p className={fieldErrorClass}>{errors.splits.message}</p>
                )}
              </div>
            )}

            {/* ── Equal (read-only) ── */}
            {splitType === "equal" && (
              <div className="flex flex-col gap-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Equal split amounts (auto-calculated):
                </p>
                {groupQuery.isLoading ? (
                  <div className="flex min-h-30 flex-col gap-3">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ) : group && group.members && group.members.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {group.members.map((member) => {
                      const equalAmount = amount
                        ? (parseFloat(amount) / group.members.length).toFixed(2)
                        : "0.00";
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between gap-4"
                        >
                          <label
                            htmlFor={`split-${member.id}`}
                            className="font-body-md text-body-md font-medium text-on-surface"
                          >
                            {member.name}
                          </label>
                          <div className="relative">
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 font-mono-data text-on-surface-variant">
                              ₹
                            </span>
                            <input
                              type="number"
                              id={`split-${member.id}`}
                              value={equalAmount}
                              readOnly
                              className="h-10 w-32 cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container-lowest pr-4 pl-8 text-right font-body-md text-body-md text-on-surface-variant focus:outline-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    No members available.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
