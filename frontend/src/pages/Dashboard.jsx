import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  getExpenses,
  getGroup,
  getBalances,
  getSettlementSuggestions,
} from "../services/splitKaroService";
import { useExpenseFilters } from "../hooks/useExpenseFilters";
import { ExpenseFilters } from "../components/ExpenseFilters";

const Dashboard = () => {
  const { selectedGroupId } = useOutletContext();
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
    const month = date.toLocaleString("en-US", { month: "short" });
    // const year = date.getFullYear();
    return `${month} ${day}`;
  };

  const setSplitTypeColor = (splitType) => {
    switch (splitType) {
      case "equal":
        return "bg-primary";
      case "exact":
        return "bg-secondary";
      case "percentage":
        return "bg-secondary-fixed-dim";
      default:
        return "bg-outline-variant";
    }
  };

  // const totalExpenses = expenses.reduce(
  //   (accumulator, expense) => accumulator + Number(expense.amount),
  //   0,
  // );

  // const totalMembers = group && group.members ? group.members.length : 0;

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
    <div className="flex flex-col gap-8">
      <div className="mb-8 grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* Balances */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Overview
          </h2>
          {group && group.members && group.members.length > 0 ? (
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
              {balances.map((bal) => {
                const amount = Number(bal.balance);
                const isOwed = amount > 0;
                const isSettled = amount === 0;
                const absAmount = Math.abs(amount);

                let borderColor = isSettled
                  ? "border-outline-variant"
                  : isOwed
                    ? "border-secondary"
                    : "border-error";
                let accentColor = isSettled
                  ? "bg-outline-variant/10"
                  : isOwed
                    ? "bg-secondary/10"
                    : "bg-error/10";
                let textColor = isSettled
                  ? "text-outline"
                  : isOwed
                    ? "text-secondary"
                    : "text-error";
                let statusText = isSettled
                  ? "Settled"
                  : isOwed
                    ? "Is owed"
                    : "Owe";

                return (
                  <div
                    key={bal.member_id}
                    className={`border bg-surface-container-lowest ${borderColor} group relative overflow-hidden rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md`}
                  >
                    <div
                      className={`absolute -top-4 -right-4 h-16 w-16 ${accentColor} rounded-full transition-transform duration-500 group-hover:scale-150`}
                    ></div>
                    <p className="mb-1 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                      {bal.name}
                    </p>
                    <p
                      className={`font-body-md text-body-md ${textColor} mb-2`}
                    >
                      {statusText}
                    </p>
                    <p
                      className={`font-headline-lg text-headline-lg ${textColor}`}
                    >
                      ₹{absAmount.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px] opacity-20">
                    account_balance_wallet
                  </span>
                  <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-50">
                    Placeholder
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simplified Settlements */}
        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Simplified Settlements
          </h2>
          <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
            {suggestions && suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-outline-variant p-4 transition-colors last:border-b-0 hover:bg-surface-container-low"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-body-md text-body-md text-on-surface">
                      <span className="font-medium text-on-surface">
                        {suggestion.from.name}
                      </span>{" "}
                      pays{" "}
                      <span className="font-medium text-on-surface">
                        {suggestion.to.name}
                      </span>
                    </p>
                    <p className="font-mono-data font-medium text-secondary">
                      ₹{suggestion.amount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/settle-up`, {
                        state: {
                          paid_by: suggestion.from.id,
                          paid_to: suggestion.to.id,
                          amount: suggestion.amount.toFixed(2),
                        },
                      })
                    }
                    className="rounded-DEFAULT border border-primary bg-transparent px-3 py-1.5 font-label-sm text-label-sm font-semibold tracking-wide text-primary transition-all hover:bg-primary/5 hover:shadow-md"
                  >
                    Settle
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="font-body-md text-body-md text-on-surface-variant">
                  All balances are settled!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Placeholders */}
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Spend by Member
          </h2>
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[48px] opacity-20">
              pie_chart
            </span>
            <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-50">
              Placeholder
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Split Type Breakdown
          </h2>
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[48px] opacity-20">
              donut_large
            </span>
            <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-50">
              Placeholder
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Spending Over Time
          </h2>
          <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-sm">
            <span className="material-symbols-outlined text-[48px] opacity-20">
              show_chart
            </span>
            <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-50">
              Placeholder
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          {group ? group.name : "Select a group to view expenses"}
        </h2>

        <ExpenseFilters
          filterProps={filterProps}
          members={group ? group.members : []}
        />

        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="w-24 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                    Description
                  </th>
                  <th className="w-32 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                    Paid By
                  </th>
                  <th className="w-32 px-4 py-3 text-right font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                    Amount
                  </th>
                  <th className="w-55 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                    Split Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredExpenses && filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <tr
                        onClick={() => toggleExpenseExpand(expense.id)}
                        className="group h-row-height-compact cursor-pointer transition-colors select-none hover:bg-surface-container-low/50"
                      >
                        <td className="px-4 py-2 font-mono-data text-sm text-on-surface-variant">
                          {formatDateToDisplay(expense.date)}
                        </td>
                        <td className="px-4 py-2 font-body-md font-medium text-on-surface">
                          {expense.description}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] text-on-secondary-container">
                              {expense.payer.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-body-md text-on-surface">
                              {expense.payer.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-mono-data font-medium text-on-surface">
                          ₹{expense.amount}
                        </td>
                        <td className="px-4 py-2">
                          <div className="bg-surface-variant inline-flex items-center gap-1.5 rounded-DEFAULT border border-outline-variant px-2 py-0.5 text-on-surface-variant">
                            <span
                              className={`h-2 w-2 rounded-full ${setSplitTypeColor(expense.splitType)}`}
                            ></span>
                            <span className="font-label-sm text-[11px] tracking-wide uppercase">
                              {expense.splitType}
                            </span>
                            <span className="ml-1 text-[10px] text-outline">
                              ({expense.splits ? expense.splits.length : 0}{" "}
                              shares)
                            </span>
                            <span
                              className={`material-symbols-outlined text-[12px] text-on-surface-variant transition-transform ${expandedExpenseIds[expense.id] ? "rotate-180" : ""}`}
                            >
                              expand_more
                            </span>
                          </div>
                        </td>
                      </tr>
                      {expandedExpenseIds[expense.id] && (
                        <tr className="bg-surface-container-low/30">
                          <td
                            colSpan="5"
                            className="border-t border-outline-variant p-6"
                          >
                            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
                              {/* Summary left */}
                              <div className="space-y-2">
                                <h4 className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                                  Payment Summary
                                </h4>
                                <div className="space-y-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                                  <p className="font-body-md text-on-surface">
                                    <span className="font-semibold text-primary">
                                      {expense.payer.name}
                                    </span>{" "}
                                    paid{" "}
                                    <span className="font-mono-data font-semibold">
                                      ₹{expense.amount}
                                    </span>
                                  </p>
                                  <div className="flex items-center justify-between border-t border-outline-variant pt-2 font-label-sm text-label-sm text-on-surface-variant">
                                    <span>
                                      Split Type:{" "}
                                      <span className="bg-surface-variant ml-1 rounded-md px-2 py-0.5 uppercase">
                                        {expense.splitType}
                                      </span>
                                    </span>
                                    <span>
                                      {formatDateToDisplay(expense.date)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {/* Shares right */}
                              <div className="space-y-2">
                                <h4 className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                                  Individual Shares
                                </h4>
                                <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                                  {expense.splits &&
                                  expense.splits.length > 0 ? (
                                    <div className="divide-y divide-outline-variant">
                                      {expense.splits.map((split) => {
                                        const isPayer =
                                          split.memberId === expense.paidBy;
                                        return (
                                          <div
                                            key={split.id}
                                            className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="bg-surface-variant flex h-5 w-5 items-center justify-center rounded-full font-label-sm text-[9px] text-on-surface-variant">
                                                {split.member.name
                                                  .substring(0, 2)
                                                  .toUpperCase()}
                                              </div>
                                              <span className="font-body-md text-body-md text-on-surface">
                                                {split.member.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-label-sm text-label-sm text-on-surface-variant">
                                                {isPayer ? "own share" : "owes"}
                                              </span>
                                              <span
                                                className={`rounded-DEFAULT px-2 py-0.5 font-mono-data font-medium ${isPayer ? "bg-surface-variant text-on-surface-variant" : "border border-secondary/20 bg-secondary/10 text-secondary"}`}
                                              >
                                                ₹
                                                {parseFloat(
                                                  split.amountOwed,
                                                ).toFixed(2)}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-body-md text-on-surface-variant">
                                      No split details
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
                      colSpan="5"
                      className="py-8 text-center text-body-md text-on-surface-variant"
                    >
                      {selectedGroupId
                        ? expenses.length > 0
                          ? "No matching expenses"
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
