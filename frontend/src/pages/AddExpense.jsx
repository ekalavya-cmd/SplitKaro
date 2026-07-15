import React from "react";
import { useState, useEffect } from "react";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
      <div className="bg-canvas rounded-xl p-xl shadow-sm border border-canvas-soft w-full">
        <h1 className="text-display-sm text-ink font-bold mb-lg">
          Add Expense
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-md">
          <div className="flex flex-col">
            <label
              htmlFor="description"
              className="text-body-sm-strong text-ink mb-xs"
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
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="text-body-sm-strong text-ink mb-xs"
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
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="paid_by"
              className="text-body-sm-strong text-ink mb-xs"
            >
              Paid By
            </label>
            <select
              id="paid_by"
              name="paid_by"
              value={inputs.paid_by}
              onChange={handleInputChange}
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
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
              className="text-body-sm-strong text-ink mb-xs"
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
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="split_type"
              className="text-body-sm-strong text-ink mb-xs"
            >
              Split Type
            </label>
            <select
              id="split_type"
              name="split_type"
              value={inputs.split_type}
              onChange={handleInputChange}
              required
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full cursor-pointer"
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
            className="cursor-pointer bg-primary text-on-primary hover:bg-primary-active rounded-xl py-md px-xl text-button-md font-semibold transition-colors mt-lg w-full shadow-sm"
          >
            Add Expense
          </button>
        </form>
      </div>

      {(inputs.split_type === "exact" ||
        inputs.split_type === "percentage" ||
        inputs.split_type === "equal") && (
        <div className="bg-canvas rounded-xl p-xl shadow-sm border border-canvas-soft w-full space-y-md">
          <h1 className="text-display-xs text-ink font-bold">
            Split Details
          </h1>
          {inputs.split_type === "exact" && (
            <div className="space-y-md">
              <p className="text-body-sm text-mute">
                Enter the exact amount each person owes:
              </p>
              {group && group.members && group.members.length > 0 ? (
                <div className="space-y-sm">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-md"
                    >
                      <label
                        htmlFor={`split-${member.id}`}
                        className="text-body-md-strong text-ink"
                      >
                        {member.name}
                      </label>
                      <input
                        type="number"
                        id={`split-${member.id}`}
                        name={`split-${member.id}`}
                        value={inputs.splits[member.id] || ""}
                        onChange={(e) =>
                          handleSplitChange(member.id, e.target.value)
                        }
                        placeholder="₹ 0.00"
                        step="0.01"
                        className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-28"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-mute">
                  No members available to split the expense.
                </p>
              )}
              {inputs.split_type === "exact" &&
                inputs.splits &&
                Object.keys(inputs.splits).length > 0 && (
                  <p className="text-body-sm-strong text-mute pt-sm border-t border-canvas-soft">
                    Total: ₹{" "}
                    {Object.values(inputs.splits)
                      .reduce((sum, val) => sum + (Number(val) || 0), 0)
                      .toFixed(2)}
                  </p>
                )}
            </div>
          )}
          {inputs.split_type === "percentage" && (
            <div className="space-y-md">
              <p className="text-body-sm text-mute">
                Enter the percentage each person owes (must sum to 100%):
              </p>
              {group && group.members && group.members.length > 0 ? (
                <div className="space-y-sm">
                  {group.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-md"
                    >
                      <label
                        htmlFor={`split-${member.id}`}
                        className="text-body-md-strong text-ink"
                      >
                        {member.name}
                      </label>
                      <input
                        type="number"
                        id={`split-${member.id}`}
                        name={`split-${member.id}`}
                        value={inputs.splits[member.id] || ""}
                        onChange={(e) =>
                          handleSplitChange(member.id, e.target.value)
                        }
                        placeholder="0%"
                        min="0"
                        max="100"
                        step="0.01"
                        className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-28"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-body-sm text-mute">
                  No members available to split the expense.
                </p>
              )}
              {inputs.split_type === "percentage" &&
                inputs.splits &&
                Object.keys(inputs.splits).length > 0 && (
                  <p className="text-body-sm-strong text-mute pt-sm border-t border-canvas-soft">
                    Total:{" "}
                    {Object.values(inputs.splits)
                      .reduce((sum, val) => sum + (Number(val) || 0), 0)
                      .toFixed(2)}
                    %
                  </p>
                )}
            </div>
          )}
          {inputs.split_type === "equal" && (
            <div className="space-y-md">
              <p className="text-body-sm text-mute">
                Equal split amounts:
              </p>
              {group && group.members && group.members.length > 0 ? (
                <div className="space-y-sm">
                  {group.members.map((member) => {
                    const equalAmount = inputs.amount
                      ? (
                          parseFloat(inputs.amount) / group.members.length
                        ).toFixed(2)
                      : "0.00";
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-md"
                      >
                        <label
                          htmlFor={`split-${member.id}`}
                          className="text-body-md-strong text-ink"
                        >
                          {member.name}
                        </label>
                        <input
                          type="text"
                          id={`split-${member.id}`}
                          name={`split-${member.id}`}
                          value={`₹ ${equalAmount}`}
                          readOnly
                          className="max-w-30 cursor-not-allowed rounded-md border border-canvas-soft bg-canvas-soft px-4 py-2 text-body-sm text-mute focus:outline-none"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-body-sm text-mute">
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
