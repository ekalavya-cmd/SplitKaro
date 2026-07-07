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
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-full";
      case "exact":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-full";
      default:
        return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full";
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
    <div className="m-4">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">Expenses</h1>
      <div className="mb-4">
        <label
          htmlFor="groupSelect"
          className="mb-2 block font-semibold text-gray-700"
        >
          Select Group:
        </label>
        <select
          id="groupSelect"
          value={selectedGroupId}
          onChange={handleGroupChange}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2"
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

      <div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          {group ? group.name : "Select a group to view expenses"}
        </h2>

        <table className="w-full border-collapse border border-gray-400 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Paid By</th>
              <th className="border border-gray-300 p-2">Amount</th>
              <th className="border border-gray-300 p-2">Split Type</th>
              <th className="border border-gray-300 p-2">Splits</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses && expenses.length > 0 ? (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="border border-gray-300 p-2">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {expense.description}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {expense.payer.name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ₹{expense.amount}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <span className={`${setSplitTypeColor(expense.splitType)}`}>
                      {expense.splitType}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2 text-sm">
                    {expense.splits &&
                      expense.splits.length > 0 &&
                      expense.splits
                        .map(
                          (split) =>
                            `${split.member.name} - ₹${split.amountOwed}`,
                        )
                        .join(", ")}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <button
                      className="cursor-pointer rounded-md bg-red-500 px-2 py-1 text-white hover:bg-red-600"
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
                  className="border border-gray-300 p-2 text-center"
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
  );
};

export default Expenses;
