import React, { useState } from "react";
import { Skeleton } from "./Skeleton";
import { formatDateForDisplay } from "../utils/dateFilters";
import { useDeleteExpense } from "../mutations/useExpenseMutations";
import { useToast } from "../context/useToast";

export const ExpenseTable = ({
  expenses = [],
  isLoading = false,
  showActions = false,
  emptyStateMessage,
  skeletonRowCount = 1,
  groupId,
}) => {
  const [expandedExpenseIds, setExpandedExpenseIds] = useState({});
  const deleteExpenseMutation = useDeleteExpense();
  const { showToast } = useToast();

  const toggleExpenseExpand = (id) => {
    setExpandedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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

  const handleDeleteExpense = (expenseId) => {
    if (!groupId) return;
    deleteExpenseMutation.mutate({ groupId, expenseId });
  };

  const colSpanCount = 5;

  return (
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
          {isLoading ? (
            Array.from({ length: skeletonRowCount }).map((_, i) => (
              <tr key={i} className="h-row-height-compact">
                <td className="px-4 py-4.5">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="px-4 py-4.5">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-4.5">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-4.5 text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </td>
                <td className="px-4 py-4.5">
                  <Skeleton className="h-4 w-20" />
                </td>
              </tr>
            ))
          ) : expenses && expenses.length > 0 ? (
            expenses.map((expense) => (
              <React.Fragment key={expense.id}>
                <tr
                  onClick={() => toggleExpenseExpand(expense.id)}
                  className="group h-row-height-compact cursor-pointer transition-colors select-none hover:bg-surface-container-low/50"
                >
                  <td className="px-4 py-1 font-mono-data text-sm whitespace-nowrap text-on-surface-variant">
                    {formatDateForDisplay(expense.date)}
                  </td>
                  <td className="px-4 py-1 font-body-md font-medium text-on-surface">
                    {expense.description}
                  </td>
                  <td className="px-4 py-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] text-on-secondary-container">
                        {expense.payer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-body-md text-on-surface">
                        {expense.payer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-1 text-right font-mono-data font-medium text-on-surface">
                    ₹{expense.amount}
                  </td>
                  <td className="px-4 py-1">
                    <div className="bg-surface-variant inline-flex items-center gap-1.5 rounded-DEFAULT border border-outline-variant px-2 py-0.5 text-on-surface-variant">
                      <span
                        className={`h-2 w-2 rounded-full ${setSplitTypeColor(expense.splitType)}`}
                      ></span>
                      <span className="font-label-sm text-[11px] tracking-wide uppercase">
                        {expense.splitType}
                      </span>
                      <span className="ml-1 text-[10px] text-outline">
                        ({expense.splits ? expense.splits.length : 0} shares)
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
                      colSpan={colSpanCount}
                      className="border-t border-outline-variant px-6 py-4"
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
                              <span>{formatDateForDisplay(expense.date)}</span>
                            </div>
                          </div>

                          {/* Action Area (Edit / Delete) */}
                          {showActions && (
                            <div className="mt-4 flex items-center gap-4">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showToast({
                                    type: "success",
                                    message: "Edit expense is coming soon.",
                                  });
                                }}
                                className="font-label-md text-label-md flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-DEFAULT border border-secondary bg-transparent px-4 py-2 font-semibold tracking-wide text-secondary transition-all hover:bg-secondary/5 hover:shadow-md disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none"
                              >
                                <span className="material-symbols-outlined text-[20px]!">
                                  stylus
                                </span>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      "Are you sure you want to delete this expense?",
                                    )
                                  ) {
                                    handleDeleteExpense(expense.id);
                                  }
                                }}
                                disabled={
                                  deleteExpenseMutation.isPending &&
                                  deleteExpenseMutation.variables?.expenseId ===
                                    expense.id
                                }
                                className="font-label-md text-label-md flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-DEFAULT bg-error px-4 py-2 font-semibold tracking-wide text-on-primary transition-all hover:bg-error/90 hover:shadow-md disabled:opacity-50 disabled:hover:bg-error disabled:hover:text-on-primary disabled:hover:shadow-none"
                              >
                                <span className="material-symbols-outlined text-[20px]!">
                                  delete
                                </span>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        {/* Shares right */}
                        <div className="space-y-2">
                          <h4 className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
                            Individual Shares
                          </h4>
                          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
                            {expense.splits && expense.splits.length > 0 ? (
                              <div className="divide-y divide-outline-variant">
                                {expense.splits.map((split) => {
                                  const isPayer =
                                    split.userId === expense.paidBy;
                                  return (
                                    <div
                                      key={split.id}
                                      className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="bg-surface-variant flex h-5 w-5 items-center justify-center rounded-full font-label-sm text-[9px] text-on-surface-variant">
                                          {split.user.name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </div>
                                        <span className="font-body-md text-body-md text-on-surface">
                                          {split.user.name}
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
                                          {parseFloat(split.amountOwed).toFixed(
                                            2,
                                          )}
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
                colSpan={colSpanCount}
                className="h-13 px-4 text-center text-body-md text-on-surface-variant"
              >
                {emptyStateMessage || "No expenses available."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
