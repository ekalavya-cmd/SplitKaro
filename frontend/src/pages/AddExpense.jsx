import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getGroup, createExpense } from "../services/splitKaroService";

const clearInputs = {
  paid_by: "",
  amount: "",
  description: "",
  split_type: "equal",
  date: new Date().toISOString().split("T")[0],
  splits: {},
};

const AddExpense = () => {
  const { id: groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [inputs, setInputs] = useState(clearInputs);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSplitChange = (memberId, value) => {
    setInputs((prev) => ({
      ...prev,
      splits: {
        ...prev.splits,
        [memberId]: Number(value) || 0,
      },
    }));
  };

  const addExpense = async () => {
    try {
      await createExpense(groupId, inputs);
      alert("Expense added successfully!");
    } catch (error) {
      console.error("Error creating expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    addExpense();
    setInputs(clearInputs);
  };

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setGroup(null);
        return;
      }

      try {
        const data = await getGroup(groupId);
        if (data) {
          setGroup(data);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setGroup(null);
      }
    };

    fetchGroup();
  }, [groupId]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="h-fit w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h1 className="mb-6 font-headline-lg text-headline-lg font-bold text-on-surface">
          Add Expense
        </h1>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
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
              placeholder="Enter expense description"
              value={inputs.description}
              onChange={handleInputChange}
              required
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
            >
              Total Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              placeholder="Enter amount"
              step="0.01"
              value={inputs.amount}
              onChange={handleInputChange}
              required
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
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
              {group && group.members && group.members.length > 0 ? (
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
            <label
              htmlFor="split_type"
              className="mb-2 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase"
            >
              Split Type
            </label>
            <select
              id="split_type"
              name="split_type"
              value={inputs.split_type}
              onChange={handleInputChange}
              required
              className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="" disabled>
                Select Split Type
              </option>
              <option value="equal">Equal</option>
              <option value="exact">Exact</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-label-sm text-label-sm tracking-wide text-on-primary uppercase shadow-sm transition-colors hover:bg-primary/90"
          >
            Add Expense
          </button>
        </form>
      </div>

      {(inputs.split_type === "exact" ||
        inputs.split_type === "percentage" ||
        inputs.split_type === "equal") && (
        <div className="flex h-fit w-full flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Split Details
          </h1>
          {inputs.split_type === "exact" && (
            <div className="flex flex-col gap-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Enter the exact amount each person owes:
              </p>
              {group && group.members && group.members.length > 0 ? (
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
                  No members available to split the expense.
                </p>
              )}
              {inputs.split_type === "exact" &&
                inputs.splits &&
                Object.keys(inputs.splits).length > 0 && (
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
              {group && group.members && group.members.length > 0 ? (
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
                          className="h-10 w-28 rounded-lg border border-outline-variant bg-surface-container-lowest pr-8 pl-4 text-right font-body-md text-body-md text-on-surface transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
                  No members available to split the expense.
                </p>
              )}
              {inputs.split_type === "percentage" &&
                inputs.splits &&
                Object.keys(inputs.splits).length > 0 && (
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
              {group && group.members && group.members.length > 0 ? (
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
                        <input
                          type="text"
                          id={`split-${member.id}`}
                          name={`split-${member.id}`}
                          value={`₹ ${equalAmount}`}
                          readOnly
                          className="h-10 w-32 cursor-not-allowed rounded-lg border border-outline-variant bg-surface-container-low px-4 text-right font-body-md text-body-md text-on-surface-variant"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  No members available to split the expense.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddExpense;
