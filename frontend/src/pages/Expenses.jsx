import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  getExpenses,
  getGroup,
  deleteExpense,
} from "../services/splitKaroService";
import { useExpenseFilters } from "../hooks/useExpenseFilters";
import { ExpenseFilters } from "../components/ExpenseFilters";

const Expenses = () => {
  const { selectedGroupId } = useOutletContext();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expandedExpenseIds, setExpandedExpenseIds] = useState({});
  const { filteredExpenses, filterProps } = useExpenseFilters(expenses);

  const toggleExpenseExpand = (id) => {
    setExpandedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
    <div className="flex flex-col gap-8">
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
                  <th className="w-24 px-4 py-3 text-right font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                    Action
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
                        <td className="px-4 py-2 font-mono-data text-sm whitespace-nowrap text-on-surface-variant">
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
                              className={`material-symbols-outlined text-[12px] transition-transform ${expandedExpenseIds[expense.id] ? "rotate-180" : ""}`}
                            >
                              expand_more
                            </span>
                          </div>
                        </td>
                        <td
                          className="px-4 py-2 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="ml-auto flex cursor-pointer items-center justify-center rounded-DEFAULT p-1 text-error transition-colors hover:bg-error/10"
                            title="Delete Expense"
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
                            <span className="material-symbols-outlined text-[20px]">
                              delete
                            </span>
                          </button>
                        </td>
                      </tr>
                      {expandedExpenseIds[expense.id] && (
                        <tr className="bg-surface-container-low/30">
                          <td
                            colSpan="6"
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
                      className="px-4 py-8 text-center text-body-md text-on-surface-variant"
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
