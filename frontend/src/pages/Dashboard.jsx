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
  const [expandedExpenseIds, setExpandedExpenseIds] = useState({});

  const toggleExpenseExpand = (id) => {
    setExpandedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
        return "bg-canvas-soft text-body px-md py-xs rounded-full text-caption font-semibold";
      case "exact":
        return "bg-primary-pale text-positive-deep px-md py-xs rounded-full text-caption font-semibold";
      default:
        return "bg-accent-orange/20 text-ink px-md py-xs rounded-full text-caption font-semibold";
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
    <div className="space-y-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md border-b border-canvas-soft pb-lg">
        <div>
          <h1 className="text-display-sm text-ink font-bold mb-xs">Dashboard</h1>
          <div className="flex flex-wrap gap-md text-body-sm text-mute">
            <span>{totalMembers} Members</span>
            <span className="text-canvas-soft font-bold">•</span>
            <span>₹{totalExpenses.toFixed(2)} Expenses</span>
            <span className="text-canvas-soft font-bold">•</span>
            <span>{suggestions.length} Pending Settlements</span>
          </div>
        </div>
      </div>

      <div className="bg-canvas border border-canvas-soft rounded-xl p-xl shadow-sm max-w-md w-full">
        <label
          htmlFor="groupSelect"
          className="text-body-sm-strong text-ink block mb-sm"
        >
          Select Group:
        </label>
        <select
          id="groupSelect"
          value={selectedGroupId}
          onChange={handleGroupChange}
          className="w-full bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          {balances.map((bal) => {
            const amount = Number(bal.balance);
            const isOwed = amount > 0;
            const isSettled = amount === 0;
            const absAmount = Math.abs(amount);

            return (
              <div
                key={bal.member_id}
                className="bg-canvas rounded-xl p-xl border border-canvas-soft shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-body-sm-strong text-mute mb-sm">
                    {bal.name}
                  </div>
                  <div className="text-display-xs text-ink font-bold mb-md">
                    ₹{absAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span
                    className={`text-body-sm-strong px-md py-xs rounded-full inline-block ${
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
        <div className="rounded-xl border border-canvas-soft bg-canvas p-xl text-center shadow-sm">
          <p className="text-body-sm-strong text-mute">
            No members in this group.
          </p>
        </div>
      )}

      <div className="space-y-md">
        <h2 className="text-display-xs text-ink font-semibold">
          Simplified Settlements
        </h2>
        {suggestions && suggestions.length > 0 ? (
          <div className="max-w-xl space-y-md w-full">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-canvas-soft bg-canvas p-lg shadow-sm"
              >
                <p className="text-body-md text-ink">
                  <span className="font-semibold">{suggestion.from.name}</span>{" "}
                  should pay{" "}
                  <span className="font-semibold">{suggestion.to.name}</span>{" "}
                  <span className="font-semibold text-positive-deep bg-primary-pale px-sm py-xxs rounded-full text-body-sm-strong">
                    ₹{suggestion.amount.toFixed(2)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/settle-up`)}
                  className="cursor-pointer bg-canvas-soft text-ink hover:bg-canvas-soft/80 rounded-xl py-md px-xl text-button-md font-semibold transition-colors"
                >
                  Settle
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-xl rounded-xl border border-canvas-soft bg-canvas p-xl text-center shadow-sm w-full">
            <p className="text-body-md text-mute font-semibold">
              All balances are settled!
            </p>
          </div>
        )}
      </div>

      <div className="space-y-md">
        <h2 className="text-display-xs text-ink font-semibold">
          {group ? group.name : "Select a group to view expenses"}
        </h2>

        <div className="bg-canvas border border-canvas-soft rounded-xl p-lg shadow-sm">
          <form className="flex flex-wrap items-center gap-md">
            <input
              type="text"
              placeholder="Expense Description"
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
            />

            <select
              name="splitType"
              id="splitType"
              value={filterSplitType}
              onChange={(e) => setFilterSplitType(e.target.value)}
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full md:w-48"
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
              className="bg-canvas text-ink border border-ink text-body-md rounded-md py-md px-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full md:w-48"
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
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Date</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Description</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Paid By</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Amount</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Split Type</th>
                  <th className="py-lg px-xl text-caption text-mute font-semibold uppercase tracking-wider">Splits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-soft">
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <tr 
                        onClick={() => toggleExpenseExpand(expense.id)}
                        className="hover:bg-canvas-soft/20 transition-colors cursor-pointer select-none"
                      >
                        <td className="py-lg px-xl text-body-sm text-ink font-medium whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-ink font-semibold">
                          {expense.description}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-body">
                          {expense.payer.name}
                        </td>
                        <td className="py-lg px-xl text-body-sm text-ink font-bold">
                          ₹{expense.amount}
                        </td>
                        <td className="py-lg px-xl text-body-sm">
                          <span className={`${setSplitTypeColor(expense.splitType)}`}>
                            {expense.splitType}
                          </span>
                        </td>
                        <td className="py-lg px-xl text-body-sm text-mute">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpenseExpand(expense.id);
                            }}
                            className="cursor-pointer bg-canvas-soft text-body hover:bg-canvas-soft/80 px-md py-xs rounded-full text-caption font-semibold flex items-center gap-xs"
                          >
                            <span>{expense.splits ? expense.splits.length : 0} shares</span>
                            <span className="text-[10px] text-mute">
                              {expandedExpenseIds[expense.id] ? "▲" : "▼"}
                            </span>
                          </button>
                        </td>
                      </tr>
                      {expandedExpenseIds[expense.id] && (
                        <tr className="bg-canvas-soft/10">
                          <td colSpan="6" className="p-xl border-t border-b border-canvas-soft">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-4xl">
                              <div className="space-y-sm">
                                <h4 className="text-body-sm-strong text-mute uppercase tracking-wider">Payment Summary</h4>
                                <div className="bg-canvas border border-canvas-soft rounded-xl p-md space-y-xs shadow-sm">
                                  <div className="flex items-center gap-sm">
                                    <span className="w-6 h-6 rounded-full bg-primary-pale text-positive-deep flex items-center justify-center font-bold text-caption">
                                      {expense.payer.name.substring(0, 2).toUpperCase()}
                                    </span>
                                    <p className="text-body-md text-ink">
                                      <span className="font-semibold">{expense.payer.name}</span> paid <span className="font-bold">₹{expense.amount}</span>
                                    </p>
                                  </div>
                                  <div className="pt-xs border-t border-canvas-soft text-caption text-mute flex items-center justify-between">
                                    <span>Split Type: <span className="font-semibold text-ink uppercase text-[10px] bg-canvas-soft px-sm py-xxs rounded-full">{expense.splitType}</span></span>
                                    <span>Date: {new Date(expense.date).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-sm">
                                <h4 className="text-body-sm-strong text-mute uppercase tracking-wider">Individual Shares</h4>
                                <div className="bg-canvas border border-canvas-soft rounded-xl p-md space-y-sm shadow-sm">
                                  {expense.splits && expense.splits.length > 0 ? (
                                    <div className="divide-y divide-canvas-soft">
                                      {expense.splits.map((split) => {
                                        const isPayer = split.memberId === expense.paidBy;
                                        const amountStr = `₹${parseFloat(split.amountOwed).toFixed(2)}`;
                                        return (
                                          <div key={split.id} className="flex items-center justify-between py-xs first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-xs">
                                              <span className="w-5 h-5 rounded-full bg-canvas-soft text-body flex items-center justify-center font-bold text-[10px]">
                                                {split.member.name.substring(0, 2).toUpperCase()}
                                              </span>
                                              <span className="text-body-sm text-ink font-medium">
                                                {split.member.name} {isPayer && <span className="text-[10px] text-mute font-normal">(Payer)</span>}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-xs">
                                              {isPayer ? (
                                                <span className="text-caption text-mute italic mr-xs">own share</span>
                                              ) : (
                                                <span className="text-[10px] text-mute mr-xs">owes {expense.payer.name}</span>
                                              )}
                                              <span className={isPayer ? "bg-canvas-soft text-body px-md py-xs rounded-full text-caption font-semibold" : "bg-primary-pale text-positive-deep px-md py-xs rounded-full text-caption font-semibold"}>
                                                {amountStr}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-body-sm text-mute">No split details available</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-xl px-xl text-body-md text-mute text-center"
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
