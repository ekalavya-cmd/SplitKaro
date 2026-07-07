import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getGroup, createExpense } from "../services/splitKaroService";

const clearInputs = {
  paid_by: "",
  amount: "",
  description: "",
  split_type: "",
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
    <div className="m-4 grid grid-cols-4 gap-4">
      <div className="w-full rounded-2xl bg-gray-100 p-8">
        <h1 className="mb-5 text-2xl font-semibold text-gray-800">
          Add Expense
        </h1>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="description"
              className="mb-2 text-sm font-semibold text-gray-700"
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
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="mb-2 text-sm font-semibold text-gray-700"
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
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="paid_by"
              className="mb-2 text-sm font-semibold text-gray-700"
            >
              Paid By
            </label>
            <select
              id="paid_by"
              name="paid_by"
              value={inputs.paid_by}
              onChange={handleInputChange}
              required
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
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
              className="mb-2 text-sm font-semibold text-gray-700"
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
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="split_type"
              className="mb-2 text-sm font-semibold text-gray-700"
            >
              Split Type
            </label>
            <select
              id="split_type"
              name="split_type"
              value={inputs.split_type}
              onChange={handleInputChange}
              required
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
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
            className="mt-2 cursor-pointer rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
          >
            Add Expense
          </button>
        </form>
      </div>

      {(inputs.split_type === "exact" ||
        inputs.split_type === "percentage" ||
        inputs.split_type === "equal") && (
        <div className="max-w-md rounded-2xl bg-gray-100 p-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Split Details
          </h1>
          {inputs.split_type === "exact" && (
            <>
              <p className="text-md mb-2 font-semibold text-gray-700">
                Enter the exact amount each person owes:
              </p>
              {group && group.members && group.members.length > 0 ? (
                group.members.map((member) => (
                  <div
                    key={member.id}
                    className="m-3 flex items-center justify-between"
                  >
                    <label
                      htmlFor={`split-${member.id}`}
                      className="mb-2 text-xl font-semibold text-gray-700"
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
                      className="max-w-30 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                ))
              ) : (
                <p className="text-md mb-2 font-semibold text-gray-700">
                  No members available to split the expense.
                </p>
              )}
              {inputs.split_type === "exact" &&
                inputs.splits &&
                Object.keys(inputs.splits).length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Total: ₹{" "}
                    {Object.values(inputs.splits)
                      .reduce((sum, val) => sum + (Number(val) || 0), 0)
                      .toFixed(2)}
                  </p>
                )}
            </>
          )}
          {inputs.split_type === "percentage" && (
            <>
              <p className="text-md mb-2 font-semibold text-gray-700">
                Enter the percentage each person owes (must sum to 100%):
              </p>
              {group && group.members && group.members.length > 0 ? (
                group.members.map((member) => (
                  <div
                    key={member.id}
                    className="m-3 flex items-center justify-between"
                  >
                    <label
                      htmlFor={`split-${member.id}`}
                      className="mb-2 text-xl font-semibold text-gray-700"
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
                      className="max-w-30 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                ))
              ) : (
                <p className="text-md mb-2 font-semibold text-gray-700">
                  No members available to split the expense.
                </p>
              )}
              {inputs.split_type === "percentage" &&
                inputs.splits &&
                Object.keys(inputs.splits).length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    Total:{" "}
                    {Object.values(inputs.splits)
                      .reduce((sum, val) => sum + (Number(val) || 0), 0)
                      .toFixed(2)}
                    %
                  </p>
                )}
            </>
          )}
          {inputs.split_type === "equal" && (
            <>
              <p className="text-md mb-2 font-semibold text-gray-700">
                Equal split amounts:
              </p>
              {group && group.members && group.members.length > 0 ? (
                group.members.map((member) => {
                  const equalAmount = inputs.amount
                    ? (
                        parseFloat(inputs.amount) / group.members.length
                      ).toFixed(2)
                    : "0.00";
                  return (
                    <div
                      key={member.id}
                      className="m-3 flex items-center justify-between"
                    >
                      <label
                        htmlFor={`split-${member.id}`}
                        className="mb-2 text-xl font-semibold text-gray-700"
                      >
                        {member.name}
                      </label>
                      <input
                        type="text"
                        id={`split-${member.id}`}
                        name={`split-${member.id}`}
                        value={`₹ ${equalAmount}`}
                        readOnly
                        className="max-w-30 cursor-not-allowed rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm"
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-md mb-2 font-semibold text-gray-700">
                  No members available to split the expense.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AddExpense;
