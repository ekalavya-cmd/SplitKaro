import React, { useState } from "react";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useCreateExpense } from "../mutations/useExpenseMutations";
import { Skeleton } from "./Skeleton";
import { Modal } from "./Modal";

const clearInputs = {
  paid_by: "",
  amount: "",
  description: "",
  split_type: "equal",
  date: new Date().toISOString().split("T")[0],
  splits: {},
};

export const AddExpenseModal = ({ isOpen, onClose, groupId }) => {
  const [inputs, setInputs] = useState(clearInputs);
  const [exactSplits, setExactSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});

  // Adjust state during render based on prop changes (React recommended pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setInputs(clearInputs);
      setExactSplits({});
      setPercentageSplits({});
    }
  }

  const groupQuery = useGroupQuery(groupId, { enabled: !!groupId && isOpen });
  const group = groupQuery.data;

  const createExpenseMutation = useCreateExpense({
    onSuccess: () => {
      setInputs(clearInputs);
      onClose();
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSplitChange = (memberId, value) => {
    const numValue = Number(value) || 0;

    setInputs((prev) => ({
      ...prev,
      splits: {
        ...prev.splits,
        [memberId]: numValue,
      },
    }));

    if (inputs.split_type === "exact") {
      setExactSplits((prev) => ({ ...prev, [memberId]: numValue }));
    } else if (inputs.split_type === "percentage") {
      setPercentageSplits((prev) => ({ ...prev, [memberId]: numValue }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    createExpenseMutation.mutate({ groupId, inputs });
  };

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
        form="add-expense-form"
        disabled={createExpenseMutation.isPending}
        className="flex h-10 items-center justify-center gap-2 rounded-DEFAULT bg-primary px-4 font-label-sm text-label-sm font-semibold tracking-wide text-on-primary transition-all hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
        onSubmit={handleFormSubmit}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col">
          <label
            htmlFor="description"
            className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Enter description"
            value={inputs.description}
            onChange={handleInputChange}
            required
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>

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
                name="amount"
                placeholder="0.00"
                step="0.01"
                value={inputs.amount}
                onChange={handleInputChange}
                required
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pr-4 pl-8 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
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
              name="paid_by"
              value={inputs.paid_by}
              onChange={handleInputChange}
              required
              className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
          </div>
        </div>

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
            name="date"
            value={inputs.date}
            onChange={handleInputChange}
            required
            className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
            Split Options
          </label>
          <div className="mb-4 flex border-b border-outline-variant">
            {["equal", "exact", "percentage"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setInputs((prev) => {
                    let newSplits = {};
                    if (type === "exact") newSplits = exactSplits;
                    if (type === "percentage") newSplits = percentageSplits;
                    return { ...prev, split_type: type, splits: newSplits };
                  })
                }
                className={`px-4 py-2 font-label-sm tracking-wider uppercase transition-colors ${
                  inputs.split_type === type
                    ? "border-b-2 border-primary font-bold text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            {inputs.split_type === "exact" && (
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
                            name={`split-${member.id}`}
                            value={inputs.splits[member.id] || ""}
                            onChange={(e) =>
                              handleSplitChange(member.id, e.target.value)
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
                {inputs.splits && Object.keys(inputs.splits).length > 0 && (
                  <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-4 font-label-sm text-label-sm font-bold text-on-surface">
                    <span className="tracking-wider uppercase">
                      Total Allocated
                    </span>
                    <span className="font-mono-data text-body-lg text-secondary">
                      ₹{" "}
                      {Object.values(inputs.splits)
                        .reduce((sum, val) => sum + (Number(val) || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {inputs.split_type === "percentage" && (
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
                            name={`split-${member.id}`}
                            value={inputs.splits[member.id] || ""}
                            onChange={(e) =>
                              handleSplitChange(member.id, e.target.value)
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
                {inputs.splits && Object.keys(inputs.splits).length > 0 && (
                  <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-4 font-label-sm text-label-sm font-bold text-on-surface">
                    <span className="tracking-wider uppercase">
                      Total Percentage
                    </span>
                    <span className="font-mono-data text-body-lg text-secondary">
                      {Object.values(inputs.splits)
                        .reduce((sum, val) => sum + (Number(val) || 0), 0)
                        .toFixed(2)}{" "}
                      %
                    </span>
                  </div>
                )}
              </div>
            )}

            {inputs.split_type === "equal" && (
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
                      const equalAmount = inputs.amount
                        ? (
                            parseFloat(inputs.amount) / group.members.length
                          ).toFixed(2)
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
                              name={`split-${member.id}`}
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
