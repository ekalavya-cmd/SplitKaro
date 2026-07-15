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
        return "bg-canvas-soft text-body px-3 py-1 rounded-full text-caption font-semibold";
      case "exact":
        return "bg-primary-pale text-positive-deep px-3 py-1 rounded-full text-caption font-semibold";
      default:
        return "bg-accent-orange/20 text-ink px-3 py-1 rounded-full text-caption font-semibold";
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-canvas-soft pb-4">
        <div>
          <h1 className="text-display-sm text-ink font-bold mb-1">Dashboard</h1>
          <div className="flex flex-wrap gap-3 text-body-sm text-mute">
            <span>{totalMembers} Members</span>
            <span className="text-canvas-soft font-bold">•</span>
            <span>₹{totalExpenses.toFixed(2)} Expenses</span>
            <span className="text-canvas-soft font-bold">•</span>
            <span>{suggestions.length} Pending Settlements</span>
          </div>
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

      {group && group.members && group.members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {balances.map((bal) => {
            const amount = Number(bal.balance);
            const isOwed = amount > 0;
            const isSettled = amount === 0;
            const absAmount = Math.abs(amount);

            return (
              <div
                key={bal.member_id}
                className="bg-canvas rounded-xl p-6 border border-canvas-soft shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-body-sm-strong text-mute mb-2">
                    {bal.name}
                  </div>
                  <div className="text-display-xs text-ink font-bold mb-3">
                    ₹{absAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span
                    className={`text-body-sm-strong px-3 py-1 rounded-full inline-block ${
                      isSettled
                        ? "bg-canvas-soft text-mute"
                        : isOwed
                          ? "bg-primary-pale text-positive-deep"
                          : "bg-negative-pale text-negative-deep"
                    }`}
                  >
                    {isSettled ? "SETTLED" : isOwed ? "IS OWED" : "OWES"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-canvas-soft bg-canvas p-6 text-center shadow-sm">
          <p className="text-body-sm-strong text-mute">
            No members in this group.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-display-xs text-ink font-semibold">
          Simplified Settlements
        </h2>
        {suggestions && suggestions.length > 0 ? (
          <div className="max-w-xl space-y-3 w-full">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-canvas-soft bg-canvas p-4 shadow-sm"
              >
                <p className="text-body-md text-ink">
                  <span className="font-semibold">{suggestion.from.name}</span>{" "}
                  should pay{" "}
                  <span className="font-semibold">{suggestion.to.name}</span>{" "}
                  <span className="font-semibold text-positive-deep bg-primary-pale px-2 py-0.5 rounded-full text-body-sm-strong">
                    ₹{suggestion.amount.toFixed(2)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/settle-up`)}
                  className="cursor-pointer bg-canvas-soft text-ink hover:bg-canvas-soft/80 rounded-xl py-3 px-6 text-button-md font-semibold transition-colors"
                >
                  Settle
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-xl rounded-xl border border-canvas-soft bg-canvas p-6 text-center shadow-sm w-full">
            <p className="text-body-md text-mute font-semibold">
              All balances are settled!
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-display-xs text-ink font-semibold">
            {group ? group.name : "Select a group to view expenses"}
          </h2>

          <button
            type="button"
            onClick={() => navigate(`/add-expense/${selectedGroupId}`)}
            className="cursor-pointer bg-primary text-on-primary hover:bg-primary-active rounded-xl py-3 px-6 text-button-md font-semibold transition-colors self-start md:self-auto shadow-sm"
          >
            Add Expense
          </button>
        </div>

        <div className="bg-canvas border border-canvas-soft rounded-xl p-4 shadow-sm">
          <form className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Expense Description"
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
            />

            <select
              name="splitType"
              id="splitType"
              value={filterSplitType}
              onChange={(e) => setFilterSplitType(e.target.value)}
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full md:w-48"
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
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full md:w-48"
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
        </div>

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
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-soft">
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
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

export default Dashboard;
