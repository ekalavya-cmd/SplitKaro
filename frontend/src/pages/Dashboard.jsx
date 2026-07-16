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
import { useExpenseFilters } from "../hooks/useExpenseFilters";
import { ExpenseFilters } from "../components/ExpenseFilters";

const Dashboard = () => {
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [expandedExpenseIds, setExpandedExpenseIds] = useState({});

  const toggleExpenseExpand = (id) => {
    setExpandedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const navigate = useNavigate();

  const { filteredExpenses, filterProps } = useExpenseFilters(expenses);

  const formatDateToDisplay = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

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
      <div className="flex flex-col gap-md border-b border-canvas-soft pb-lg md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-xs text-display-sm font-bold text-ink">
            Dashboard
          </h1>
          <div className="flex flex-wrap gap-md text-body-sm text-mute">
            <span>{totalMembers} Members</span>
            <span className="font-bold text-canvas-soft">•</span>
            <span>₹{totalExpenses.toFixed(2)} Expenses</span>
            <span className="font-bold text-canvas-soft">•</span>
            <span>{suggestions.length} Pending Settlements</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md rounded-xl border border-canvas-soft bg-canvas p-xl shadow-sm">
        <label
          htmlFor="groupSelect"
          className="mb-sm block text-body-sm-strong text-ink"
        >
          Select Group:
        </label>
        <select
          id="groupSelect"
          value={selectedGroupId}
          onChange={handleGroupChange}
          className="w-full cursor-pointer rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
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
        <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {balances.map((bal) => {
            const amount = Number(bal.balance);
            const isOwed = amount > 0;
            const isSettled = amount === 0;
            const absAmount = Math.abs(amount);

            return (
              <div
                key={bal.member_id}
                className="flex flex-col justify-between rounded-xl border border-canvas-soft bg-canvas p-xl shadow-sm"
              >
                <div>
                  <div className="mb-sm text-body-sm-strong text-mute">
                    {bal.name}
                  </div>
                  <div className="mb-md text-display-xs font-bold text-ink">
                    ₹{absAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-block rounded-full px-md py-xs text-body-sm-strong ${
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
        <h2 className="text-display-xs font-semibold text-ink">
          Simplified Settlements
        </h2>
        {suggestions && suggestions.length > 0 ? (
          <div className="w-full max-w-xl space-y-md">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-canvas-soft bg-canvas p-lg shadow-sm"
              >
                <p className="text-body-md text-ink">
                  <span className="font-semibold">{suggestion.from.name}</span>{" "}
                  should pay{" "}
                  <span className="font-semibold">{suggestion.to.name}</span>{" "}
                  <span className="rounded-full bg-primary-pale px-sm py-xxs text-body-sm-strong font-semibold text-positive-deep">
                    ₹{suggestion.amount.toFixed(2)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/settle-up`, {
                      state: {
                        paid_by: suggestion.from.id,
                        paid_to: suggestion.to.id,
                        amount: suggestion.amount.toFixed(2),
                      },
                    })
                  }
                  className="cursor-pointer rounded-xl bg-canvas-soft px-xl py-md text-button-md font-semibold text-ink transition-colors hover:bg-canvas-soft/80"
                >
                  Settle
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-xl rounded-xl border border-canvas-soft bg-canvas p-xl text-center shadow-sm">
            <p className="text-body-md font-semibold text-mute">
              All balances are settled!
            </p>
          </div>
        )}
      </div>

      <div className="space-y-md">
        <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <h2 className="text-display-xs font-semibold text-ink">
            {group ? group.name : "Select a group to view expenses"}
          </h2>

          <button
            type="button"
            onClick={() => navigate(`/add-expense/${selectedGroupId}`)}
            className="cursor-pointer self-start rounded-xl bg-primary px-xl py-md text-button-md font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-active md:self-auto"
          >
            Add Expense
          </button>
        </div>

        <ExpenseFilters filterProps={filterProps} members={group ? group.members : []} />

        <div className="overflow-hidden rounded-xl border border-canvas-soft bg-canvas shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-canvas-soft bg-canvas-soft">
                  <th className="px-xl py-lg text-caption font-semibold tracking-wider text-mute uppercase">
                    Date
                  </th>
                  <th className="px-xl py-lg text-caption font-semibold tracking-wider text-mute uppercase">
                    Description
                  </th>
                  <th className="px-xl py-lg text-caption font-semibold tracking-wider text-mute uppercase">
                    Paid By
                  </th>
                  <th className="px-xl py-lg text-caption font-semibold tracking-wider text-mute uppercase">
                    Amount
                  </th>
                  <th className="px-xl py-lg text-caption font-semibold tracking-wider text-mute uppercase">
                    Split Type
                  </th>
                  <th className="px-xl py-lg text-caption font-semibold tracking-wider text-mute uppercase">
                    Splits
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-soft">
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <tr
                        onClick={() => toggleExpenseExpand(expense.id)}
                        className="cursor-pointer transition-colors select-none hover:bg-canvas-soft/20"
                      >
                        <td className="px-xl py-lg text-body-sm font-medium whitespace-nowrap text-ink">
                          {formatDateToDisplay(expense.date)}
                        </td>
                        <td className="px-xl py-lg text-body-sm font-semibold text-ink">
                          {expense.description}
                        </td>
                        <td className="px-xl py-lg text-body-sm text-body">
                          {expense.payer.name}
                        </td>
                        <td className="px-xl py-lg text-body-sm font-bold text-ink">
                          ₹{expense.amount}
                        </td>
                        <td className="px-xl py-lg text-body-sm">
                          <span
                            className={`${setSplitTypeColor(expense.splitType)}`}
                          >
                            {expense.splitType}
                          </span>
                        </td>
                        <td className="px-xl py-lg text-body-sm text-mute">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpenseExpand(expense.id);
                            }}
                            className="flex cursor-pointer items-center gap-xs rounded-full bg-canvas-soft px-md py-xs text-caption font-semibold text-body hover:bg-canvas-soft/80"
                          >
                            <span>
                              {expense.splits ? expense.splits.length : 0}{" "}
                              shares
                            </span>
                            <span className="text-[10px] text-mute">
                              {expandedExpenseIds[expense.id] ? "▲" : "▼"}
                            </span>
                          </button>
                        </td>
                      </tr>
                      {expandedExpenseIds[expense.id] && (
                        <tr className="bg-canvas-soft/10">
                          <td
                            colSpan="6"
                            className="border-t border-b border-canvas-soft p-xl"
                          >
                            <div className="grid max-w-4xl grid-cols-1 gap-lg md:grid-cols-2">
                              <div className="space-y-sm">
                                <h4 className="text-body-sm-strong tracking-wider text-mute uppercase">
                                  Payment Summary
                                </h4>
                                <div className="space-y-xs rounded-xl border border-canvas-soft bg-canvas p-md shadow-sm">
                                  <div className="flex items-center gap-sm">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-pale text-caption font-bold text-positive-deep">
                                      {expense.payer.name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </span>
                                    <p className="text-body-md text-ink">
                                      <span className="font-semibold">
                                        {expense.payer.name}
                                      </span>{" "}
                                      paid{" "}
                                      <span className="font-bold">
                                        ₹{expense.amount}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between border-t border-canvas-soft pt-xs text-caption text-mute">
                                    <span>
                                      Split Type:{" "}
                                      <span className="rounded-full bg-canvas-soft px-sm py-xxs text-[10px] font-semibold text-ink uppercase">
                                        {expense.splitType}
                                      </span>
                                    </span>
                                    <span>
                                      Date: {formatDateToDisplay(expense.date)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-sm">
                                <h4 className="text-body-sm-strong tracking-wider text-mute uppercase">
                                  Individual Shares
                                </h4>
                                <div className="space-y-sm rounded-xl border border-canvas-soft bg-canvas p-md shadow-sm">
                                  {expense.splits &&
                                  expense.splits.length > 0 ? (
                                    <div className="divide-y divide-canvas-soft">
                                      {expense.splits.map((split) => {
                                        const isPayer =
                                          split.memberId === expense.paidBy;
                                        const amountStr = `₹${parseFloat(split.amountOwed).toFixed(2)}`;
                                        return (
                                          <div
                                            key={split.id}
                                            className="flex items-center justify-between py-xs first:pt-0 last:pb-0"
                                          >
                                            <div className="flex items-center gap-xs">
                                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-canvas-soft text-[10px] font-bold text-body">
                                                {split.member.name
                                                  .substring(0, 2)
                                                  .toUpperCase()}
                                              </span>
                                              <span className="text-body-sm font-medium text-ink">
                                                {split.member.name}{" "}
                                                {isPayer && (
                                                  <span className="text-[10px] font-normal text-mute">
                                                    (Payer)
                                                  </span>
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-xs">
                                              {isPayer ? (
                                                <span className="mr-xs text-caption text-mute italic">
                                                  own share
                                                </span>
                                              ) : (
                                                <span className="mr-xs text-[10px] text-mute">
                                                  owes {expense.payer.name}
                                                </span>
                                              )}
                                              <span
                                                className={
                                                  isPayer
                                                    ? "rounded-full bg-canvas-soft px-md py-xs text-caption font-semibold text-body"
                                                    : "rounded-full bg-primary-pale px-md py-xs text-caption font-semibold text-positive-deep"
                                                }
                                              >
                                                {amountStr}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-body-sm text-mute">
                                      No split details available
                                    </p>
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
                      className="px-xl py-xl text-center text-body-md text-mute"
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
