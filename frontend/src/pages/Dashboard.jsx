import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useBalancesQuery } from "../queries/useBalancesQueries";
import { useExpensesQuery } from "../queries/useExpensesQueries";
import { useSettlementSuggestionsQuery } from "../queries/useSettlementsQueries";
import { Skeleton } from "../components/Skeleton";
import { usePageLoadingState } from "../hooks/usePageLoadingState";
import { formatDateForDisplay } from "../utils/dateFilters";
import { SimplifiedSettlements } from "../components/SimplifiedSettlements";
import { SpendByMemberChart } from "../components/analytics/SpendByMemberChart";
import { SplitTypeChart } from "../components/analytics/SplitTypeChart";
import { SpendingTimeChart } from "../components/analytics/SpendingTimeChart";

const RECENT_EXPENSES_COUNT = 5;

const Dashboard = () => {
  const { selectedGroupId, openSettlementModal } = useOutletContext();
  const [expandedExpenseIds, setExpandedExpenseIds] = useState({});

  const groupQuery = useGroupQuery(selectedGroupId);
  const group = groupQuery.data;

  const expensesQuery = useExpensesQuery(selectedGroupId);
  const expenses = expensesQuery.data || [];

  const balancesQuery = useBalancesQuery(selectedGroupId);
  const balances = balancesQuery.data || [];

  const suggestionsQuery = useSettlementSuggestionsQuery(selectedGroupId);
  const suggestions = suggestionsQuery.data || [];

  const { isDataLoading, isError, errors, refetchAll } = usePageLoadingState([
    groupQuery,
    expensesQuery,
    balancesQuery,
    suggestionsQuery,
  ]);

  const hasData =
    groupQuery.data !== undefined &&
    expensesQuery.data !== undefined &&
    balancesQuery.data !== undefined &&
    suggestionsQuery.data !== undefined;
  const showSkeleton =
    !!selectedGroupId && (isDataLoading || (isError && !hasData));

  const toggleExpenseExpand = (id) => {
    setExpandedExpenseIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, RECENT_EXPENSES_COUNT);

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

  return (
    <div className="flex flex-col gap-8">
      {isError && (
        <div className="flex min-h-24 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Couldn't load overview data.
            </p>
            <button
              onClick={refetchAll}
              className="font-label-sm text-label-sm font-semibold underline underline-offset-2 hover:text-primary"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* Balances */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Overview
          </h2>
          {showSkeleton ? (
            <div className="grid grid-cols-1 gap-gutter sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm"
                >
                  <Skeleton className="mb-1 h-3 w-16" />
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="h-7 w-28" />
                </div>
              ))}
            </div>
          ) : group && group.members && group.members.length > 0 ? (
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
                    key={bal.user_id}
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
                <div
                  key={i}
                  className="flex h-28 flex-col items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant"
                >
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
        <SimplifiedSettlements
          suggestions={suggestions}
          isLoading={showSkeleton}
          emptyStateMessage={
            !selectedGroupId
              ? "Select a group to view balances."
              : "All balances are settled!"
          }
          onSettle={(from, to, amount) => {
            openSettlementModal({
              paid_by: from.id,
              paid_to: to.id,
              amount: amount.toFixed(2),
            });
          }}
        />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <SpendByMemberChart
          expenses={expenses}
          members={group?.members || []}
          isLoading={showSkeleton}
        />
        <SplitTypeChart expenses={expenses} isLoading={showSkeleton} />
        <SpendingTimeChart expenses={expenses} isLoading={showSkeleton} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Recent Expenses
        </h2>

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
                {showSkeleton ? (
                  Array.from({ length: 1 }).map((_, i) => (
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
                ) : recentExpenses && recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <React.Fragment key={expense.id}>
                      <tr
                        onClick={() => toggleExpenseExpand(expense.id)}
                        className="group h-row-height-compact cursor-pointer transition-colors select-none hover:bg-surface-container-low/50"
                      >
                        <td className="px-4 py-3 font-mono-data text-sm whitespace-nowrap text-on-surface-variant">
                          {formatDateForDisplay(expense.date)}
                        </td>
                        <td className="px-4 py-3 font-body-md font-medium text-on-surface">
                          {expense.description}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] text-on-secondary-container">
                              {expense.payer.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-body-md text-on-surface">
                              {expense.payer.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono-data font-medium text-on-surface">
                          ₹{expense.amount}
                        </td>
                        <td className="px-4 py-3">
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
                                    <span>
                                      {formatDateForDisplay(expense.date)}
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
                      className="h-13 px-4 text-center text-body-md text-on-surface-variant"
                    >
                      {selectedGroupId
                        ? "No expenses added yet for this group."
                        : "Select a group to view expenses."}
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
