import React from "react";
import { useOutletContext } from "react-router-dom";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useBalancesQuery } from "../queries/useBalancesQueries";
import { useExpensesQuery } from "../queries/useExpensesQueries";
import { useSettlementSuggestionsQuery } from "../queries/useSettlementsQueries";
import { Skeleton } from "../components/Skeleton";
import { usePageLoadingState } from "../hooks/usePageLoadingState";
import { SimplifiedSettlements } from "../components/SimplifiedSettlements";
import { SpendByMemberChart } from "../components/analytics/SpendByMemberChart";
import { SplitTypeChart } from "../components/analytics/SplitTypeChart";
import { SpendingTimeChart } from "../components/analytics/SpendingTimeChart";
import { ExpenseTable } from "../components/ExpenseTable";

const RECENT_EXPENSES_COUNT = 5;

const Dashboard = () => {
  const { selectedGroupId, openSettlementModal } = useOutletContext();

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

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, RECENT_EXPENSES_COUNT);

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
          <ExpenseTable
            expenses={recentExpenses}
            isLoading={showSkeleton}
            showActions={true}
            groupId={selectedGroupId}
            emptyStateMessage={
              selectedGroupId
                ? "No expenses added yet for this group."
                : "Select a group to view expenses."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
