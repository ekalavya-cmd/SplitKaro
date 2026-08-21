import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "./Modal";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useCreateSettlement } from "../mutations/useSettlementMutations";

// ---------------------------------------------------------------------------
// Schema — mirrors backend settlement.service.js validation exactly:
//   - paid_by required, paid_to required, amount > 0
//   - paid_by !== paid_to (backend: "Cannot record settlement to yourself")
// ---------------------------------------------------------------------------
const settlementSchema = z
  .object({
    paid_by: z.string().min(1, "Payer is required"),
    paid_to: z.string().min(1, "Payee is required"),
    amount: z.coerce
      .number({ invalid_type_error: "Amount is required" })
      .positive("Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
  })
  .refine((data) => data.paid_by !== data.paid_to, {
    message: "Payer and payee cannot be the same person",
    path: ["paid_to"],
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
export const RecordSettlementModal = ({
  isOpen,
  onClose,
  groupId,
  initialData,
}) => {
  const [serverError, setServerError] = useState(null);
  // One-way latch: flips to true on first amount edit; resets only when modal reopens.
  // Using a boolean (not a value comparison) so re-typing the original value doesn't
  // restore the tag — it stays hidden once the user has touched the field.
  const [amountTouched, setAmountTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      paid_by: "",
      paid_to: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Subscribe to live amount value so we can compute the tag visibility.
  const watchedAmount = useWatch({ control, name: "amount" });

  const groupQuery = useGroupQuery(groupId, { enabled: !!groupId && isOpen });
  const group = groupQuery.data;

  // Pre-fill from initialData on open; clear on close (render-phase pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (initialData) {
        reset({
          paid_by: String(initialData.paid_by ?? ""),
          paid_to: String(initialData.paid_to ?? ""),
          amount: initialData.amount ?? "",
          date: new Date().toISOString().split("T")[0],
        });
      } else {
        reset({
          paid_by: "",
          paid_to: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
        });
      }
      setServerError(null);
      // Reset the latch every time the modal opens so a fresh suggestion shows the tag.
      setAmountTouched(false);
    } else {
      reset({
        paid_by: "",
        paid_to: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setServerError(null);
    }
  }

  // Show the "SUGGESTED" tag only when:
  //   1. The modal was opened with a pre-filled suggestion (initialData present), AND
  //   2. The user has not yet touched the amount field in this session.
  const showSuggestedTag = !!initialData && !amountTouched;

  const createSettlementMutation = useCreateSettlement({
    onSuccess: () => {
      reset();
      setServerError(null);
      onClose();
    },
    onError: (error) => {
      console.error("Error creating settlement:", error);
      setServerError(
        error.message || "Failed to record settlement. Please try again."
      );
    },
  });

  const onSubmit = (data) => {
    if (!groupId) return;
    setServerError(null);
    createSettlementMutation.mutate({ groupId, inputs: data });
  };

  // Intercept the amount field's onChange to set the one-way touched latch,
  // while still forwarding the event to react-hook-form's own handler.
  const amountRegister = register("amount");

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="font-label-sm text-label-sm font-semibold tracking-wide text-on-surface-variant hover:text-on-surface"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="record-settlement-form"
        disabled={createSettlementMutation.isPending}
        className="flex h-10 items-center justify-center gap-2 rounded-DEFAULT bg-primary px-4 font-label-sm text-label-sm font-semibold tracking-wide text-on-primary transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createSettlementMutation.isPending ? "Recording..." : "Record Payment"}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Settlement"
      footer={footer}
    >
      <form
        id="record-settlement-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        {/* Backend error banner */}
        {serverError && (
          <div className="rounded-lg border border-error/30 bg-error-container px-4 py-3">
            <p className="font-label-sm text-label-sm text-error">{serverError}</p>
          </div>
        )}

        {/* Payer */}
        <div className="flex flex-col">
          <label
            htmlFor="paid_by"
            className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
          >
            Payer
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

        {/* Payee */}
        <div className="flex flex-col">
          <label
            htmlFor="paid_to"
            className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
          >
            Payee
          </label>
          <select
            id="paid_to"
            {...register("paid_to")}
            className={`h-10 w-full cursor-pointer rounded-lg border ${fieldBorder(!!errors.paid_to)} bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none`}
          >
            <option value="" disabled>
              Select Payee
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
          {errors.paid_to && (
            <p className={fieldErrorClass}>{errors.paid_to.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="flex flex-col">
          <label
            htmlFor="amount"
            className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
          >
            Amount
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
              {...amountRegister}
              onChange={(e) => {
                amountRegister.onChange(e); // forward to RHF
                setAmountTouched(true);     // one-way latch: hide the tag
              }}
              className={`h-10 w-full rounded-lg border ${fieldBorder(!!errors.amount)} bg-surface-container-lowest pl-8 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none ${showSuggestedTag ? "pr-24" : "pr-4"}`}
            />
            {showSuggestedTag && (
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-primary-fixed px-2 py-0.5 font-label-sm text-[10px] font-semibold tracking-wider text-on-primary-fixed uppercase">
                Suggested
              </span>
            )}
          </div>
          {errors.amount && (
            <p className={fieldErrorClass}>{errors.amount.message}</p>
          )}
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
      </form>
    </Modal>
  );
};
