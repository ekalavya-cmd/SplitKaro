import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getExpenses,
  getGroups,
  getGroup,
  getBalances,
  getSettlementSuggestions,
} from "../services/splitKaroService";
import useDebounce from "../hooks/useDebounce";

const Dashboard = () => {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filterDescription, setFilterDescription] = useState("");
  const [filterSplitType, setFilterSplitType] = useState("all");
  const [filterPaidBy, setFilterPaidBy] = useState("all");

  const navigate = useNavigate();

  const debouncedDescription = useDebounce(filterDescription, 300);

  const filteredExpenses = expenses.filter((expense) => {
    const descriptionMatch = expense.description
      .toLowerCase()
      .includes(debouncedDescription.toLowerCase());
    const splitTypeMatch =
      filterSplitType === "all" || expense.splitType === filterSplitType;
    const paidByMatch =
      filterPaidBy === "all" || String(expense.paidBy) === filterPaidBy;

    return descriptionMatch && splitTypeMatch && paidByMatch;
  });

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

  const totalExpenses = expenses.reduce(
    (accumulator, expense) => accumulator + Number(expense.amount),
    0,
  );

  const totalMembers = group && group.members ? group.members.length : 0;

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

  useEffect(() => {
    const fetchBalances = async () => {
      if (!selectedGroupId) {
        setBalances([]);
        return;
      }

      try {
        const data = await getBalances(selectedGroupId);
        if (data && data.balances) {
          setBalances(data.balances);
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
        setBalances([]);
      }
    };

    fetchBalances();
  }, [selectedGroupId]);

  useEffect(() => {
    const fetchSettlementSuggestions = async () => {
      if (!selectedGroupId) {
        setSuggestions([]);
        return;
      }
      try {
        const data = await getSettlementSuggestions(selectedGroupId);
        if (data && data.length > 0) {
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Error fetching settlement suggestions:", error);
        setSuggestions([]);
      }
    };

    fetchSettlementSuggestions();
  }, [selectedGroupId]);

  return (
    <div className="m-4">
      <div className="mb-4">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-3">
          <p className="text-sm text-gray-600">{totalMembers} Members</p>
          <p className="text-sm text-gray-600">
            ₹{totalExpenses.toFixed(2)} Expenses
          </p>
          <p className="text-sm text-gray-600">
            {suggestions.length} Pending Settlements
          </p>
        </div>
      </div>

      <div className="mb-6">
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

      {group && group.members && group.members.length > 0 ? (
        <div className="mb-4 grid grid-cols-4 gap-4">
          {balances.map((bal) => {
            const amount = Number(bal.balance);
            const isOwed = amount > 0;
            const isSettled = amount === 0;
            const absAmount = Math.abs(amount);

            return (
              <div
                key={bal.member_id}
                className={`rounded-2xl border p-5 ${
                  isSettled
                    ? "border-gray-300 bg-gray-100"
                    : isOwed
                      ? "border-gray-300 bg-green-100"
                      : "border-gray-300 bg-red-100"
                }`}
              >
                <div className="mb-3 text-sm font-medium text-gray-600">
                  {bal.name}
                </div>
                <div className="mb-3 text-3xl font-semibold text-gray-900">
                  ₹{absAmount.toFixed(2)}
                </div>
                <div
                  className={`text-sm font-medium ${
                    isSettled
                      ? "text-gray-700"
                      : isOwed
                        ? "text-green-700"
                        : "text-red-700"
                  }`}
                >
                  {isSettled ? "SETTLED" : isOwed ? "IS OWED" : "OWES"}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-4 rounded-xl border border-gray-300 bg-gray-100 p-5 text-center">
          <p className="text-sm font-medium text-gray-600">
            No members in this group.
          </p>
        </div>
      )}

      <div className="mb-4">
        <h2 className="mt-4 mb-2 text-2xl font-semibold text-gray-800">
          Simplified Settlements
        </h2>
        {suggestions && suggestions.length > 0 ? (
          <div className="max-w-150 space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-lg">
                  <span className="font-semibold">{suggestion.from.name}</span>{" "}
                  should pay{" "}
                  <span className="font-semibold">{suggestion.to.name}</span>{" "}
                  <span className="font-bold text-green-600">
                    ₹{suggestion.amount.toFixed(2)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/settle-up`)}
                  className="text-md cursor-pointer rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  Settle
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 max-w-150 rounded-lg border border-gray-300 bg-gray-100 p-5">
            <p className="text-md font-medium text-gray-600">
              All balances are settled!
            </p>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-800">
          {group ? group.name : "Select a group to view expenses"}
        </h2>

        <div className="flex items-center justify-between">
          <form className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Expense Description"
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="mb-4 rounded border border-gray-400 p-2"
            />

            <select
              name="splitType"
              id="splitType"
              value={filterSplitType}
              onChange={(e) => setFilterSplitType(e.target.value)}
              className="mb-4 rounded border border-gray-400 p-2"
            >
              <option value="all">All Type</option>
              <option value="equal">Equal Split</option>
              <option value="exact">Exact Split</option>
              <option value="percentage">Percentage Split</option>
            </select>

            <select
              name="paidBy"
              id="paidBy"
              value={filterPaidBy}
              onChange={(e) => setFilterPaidBy(e.target.value)}
              className="mb-4 w-30 rounded border border-gray-400 p-2"
            >
              <option value="all">All Payers</option>
              {group && group.members && group.members.length > 0 ? (
                group.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))
              ) : (
                <option disabled>No members available</option>
              )}
            </select>
          </form>

          <button
            type="button"
            onClick={() => navigate(`/add-expense/${selectedGroupId}`)}
            className="text-md cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add Expense
          </button>
        </div>

        <table className="w-full border-collapse border border-gray-400 text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Paid By</th>
              <th className="border border-gray-300 p-2">Amount</th>
              <th className="border border-gray-300 p-2">Split Type</th>
              <th className="border border-gray-300 p-2">Splits</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses && filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
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
                  <td className="border border-gray-300 p-2">
                    {expense.splits &&
                      expense.splits.length > 0 &&
                      expense.splits
                        .map(
                          (split) =>
                            `${split.member.name} - ₹${split.amountOwed}`,
                        )
                        .join(", ")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
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

export default Dashboard;
