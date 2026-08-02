import React, { useState } from "react";
import { Modal } from "./Modal";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useCreateSettlement } from "../mutations/useSettlementMutations";

const clearInputs = {
  paid_by: "",
  paid_to: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
};

export const RecordSettlementModal = ({
  isOpen,
  onClose,
  groupId,
  initialData,
}) => {
  const [inputs, setInputs] = useState(clearInputs);

  const groupQuery = useGroupQuery(groupId, { enabled: !!groupId && isOpen });
  const group = groupQuery.data;

  // Adjust state during render based on prop changes (React recommended pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (initialData) {
        setInputs({
          ...clearInputs,
          paid_by: initialData?.paid_by || "",
          paid_to: initialData?.paid_to || "",
          amount: initialData?.amount || "",
        });
      } else {
        setInputs(clearInputs);
      }
    } else {
      setInputs(clearInputs);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const createSettlementMutation = useCreateSettlement({
    onSuccess: () => {
      onClose();
    },
    onError: (error) => {
      console.error("Error creating settlement:", error);
      alert(error.message || "Failed to record settlement. Please try again.");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!groupId) return;
    createSettlementMutation.mutate({ groupId, inputs });
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
        onSubmit={handleFormSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col">
          <label
            htmlFor="paid_by"
            className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
          >
            Payer
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

        <div className="flex flex-col">
          <label
            htmlFor="paid_to"
            className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
          >
            Payee
          </label>
          <select
            id="paid_to"
            name="paid_to"
            value={inputs.paid_to}
            onChange={handleInputChange}
            required
            className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
        </div>

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
              name="amount"
              value={inputs.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              required
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pr-4 pl-8 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
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
      </form>
    </Modal>
  );
};
