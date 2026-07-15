import React from "react";
import { useState, useEffect } from "react";
import {
  getExpenses,
  getGroups,
  getGroup,
  deleteExpense,
} from "../services/splitKaroService";

const Expenses = () => {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);

  const setSplitTypeColor = (splitType) => {
    switch (splitType) {
      case "equal":
        return "bg-canvas-soft text-body px-3 py-1 rounded-full text-caption font-semibold";
      case "exact":
        return "bg-primary-pale text-positive-deep px-3 py-1 rounded-full text-caption font-semibold";
      default:
        return "bg-accent-orange/20 text-ink px-3 py-1 rounded-full text-caption font-semibold";
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getGroups();
        if (data && data.length > 0) {
          setGroups(data);
          setSelectedGroupId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setGroups([]);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!selectedGroupId) {
        setExpenses([]);
        return;
      }

      try {
        const data = await getExpenses(selectedGroupId);
        if (data && data.expenses) {
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setExpenses([]);
      }
    };

    fetchExpenses();
  }, [selectedGroupId]);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!selectedGroupId) {
        setGroup(null);
        return;
      }

      try {
        const data = await getGroup(selectedGroupId);
        if (data) {
          setGroup(data);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setGroup(null);
      }
    };

    fetchGroup();
  }, [selectedGroupId]);

  const handleDeleteExpense = async (expenseId) => {
    try {
      await deleteExpense(expenseId);
      const updatedExpenses = await getExpenses(selectedGroupId);
      if (
        updatedExpenses &&
        updatedExpenses.expenses &&
        updatedExpenses.expenses.length > 0
      ) {
        setExpenses(updatedExpenses.expenses);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-canvas-soft pb-4">
        <div>
          <h1 className="text-display-sm text-ink font-bold">Expenses</h1>
        </div>
      </div>

      <div className="bg-canvas border border-canvas-soft rounded-xl p-6 shadow-sm max-w-md w-full">
        <label
          htmlFor="groupSelect"
          className="text-body-sm-strong text-ink block mb-2"
        >
          Select Group:
        </label>
        <select
          id="groupSelect"
          value={selectedGroupId}
          onChange={handleGroupChange}
          className="w-full bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          <option value="" disabled>
            Select a group
          </option>
          {Array.isArray(groups) && groups.length > 0 ? (
            groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))
          ) : (
            <option disabled>No groups available</option>
          )}
        </select>
      </div>

      <div className="space-y-3">
        <h2 className="text-display-xs text-ink font-semibold">
          {group ? group.name : "Select a group to view expenses"}
        </h2>

        <div className="bg-canvas border border-canvas-soft rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-canvas-soft border-b border-canvas-soft">
                  <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Paid By</th>
                  <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Split Type</th>
                  <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Splits</th>
                  <th className="py-4 px-6 text-caption text-mute font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-soft">
                {expenses && expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-canvas-soft/20 transition-colors">
                      <td className="py-4 px-6 text-body-sm text-ink font-medium whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-body-sm text-ink font-semibold">
                        {expense.description}
                      </td>
                      <td className="py-4 px-6 text-body-sm text-body">
                        {expense.payer.name}
                      </td>
                      <td className="py-4 px-6 text-body-sm text-ink font-bold">
                        ₹{expense.amount}
                      </td>
                      <td className="py-4 px-6 text-body-sm">
                        <span className={`${setSplitTypeColor(expense.splitType)}`}>
                          {expense.splitType}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-body-sm text-mute">
                        {expense.splits &&
                          expense.splits.length > 0 &&
                          expense.splits
                            .map(
                              (split) =>
                                `${split.member.name} - ₹${split.amountOwed}`,
                            )
                            .join(", ")}
                      </td>
                      <td className="py-4 px-6 text-body-sm">
                        <button
                          className="cursor-pointer text-negative hover:underline text-body-sm-strong transition-colors"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this expense?",
                              )
                            ) {
                              handleDeleteExpense(expense.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-6 px-6 text-body-md text-mute text-center"
                    >
                      {selectedGroupId
                        ? expenses.length > 0
                          ? "No expenses match the selected filters"
                          : "No expenses for this group"
                        : "Select a group to view expenses"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
