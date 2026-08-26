import React, { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useExpensesQuery } from "../queries/useExpensesQueries";
import { useDeleteExpense } from "../mutations/useExpenseMutations";
import { useExpenseFilters } from "../hooks/useExpenseFilters";
import { ExpenseFilters } from "../components/ExpenseFilters";
import { Pagination } from "../components/Pagination";
// Removed PersistentErrorBanner in favor of inline retry state
import { Skeleton } from "../components/Skeleton";
import { usePageLoadingState } from "../hooks/usePageLoadingState";
import { usePagination } from "../hooks/usePagination";
import { calculatePresetDates } from "../utils/dateFilters";
import { formatDateForDisplay } from "../utils/dateFilters";

const EXPENSES_PER_PAGE = 10;

const Expenses = () => {
  const { selectedGroupId } = useOutletContext();
  const [expandedExpenseIds, setExpandedExpenseIds] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive initial filter values from URL params.
  // useState only reads these on the first render; re-renders ignore them.
  const urlPreset = searchParams.get("preset") || "all";
  let initFromDate = searchParams.get("from") || "";
  let initToDate = searchParams.get("to") || "";
  // For non-custom presets, recalculate dates so they're always current
  // (e.g. "this-week" rehydrates to the correct week, not the stale stored dates).
  // Only "custom" stores explicit from/to in the URL.
  if (urlPreset !== "all" && urlPreset !== "custom") {
    const { fromDate, toDate } = calculatePresetDates(urlPreset);
    initFromDate = fromDate;
    initToDate = toDate;
  }
  const initialFilterValues = {
    filterDescription: searchParams.get("q") || "",
    filterSplitType: searchParams.get("split") || "all",
    filterPaidBy: searchParams.get("payer") || "all",
    filterDatePreset: urlPreset,
    filterFromDate: initFromDate,
    filterToDate: initToDate,
    filterMinAmount: searchParams.get("min") || "",
    filterMaxAmount: searchParams.get("max") || "",
  };

  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const groupQuery = useGroupQuery(selectedGroupId);
  const group = groupQuery.data;

  const expensesQuery = useExpensesQuery(selectedGroupId);
  const expenses = expensesQuery.data || [];

  const { isDataLoading, isError, errors, refetchAll } = usePageLoadingState([
    groupQuery,
    expensesQuery,
  ]);

  const deleteExpenseMutation = useDeleteExpense();

  const { filteredExpenses, filterProps } = useExpenseFilters(
    expenses,
    initialFilterValues,
  );

  // Destructure the raw setters and state values for the URL sync effect
  const {
    filterDescription,
    setFilterDescription,
    filterSplitType,
    setFilterSplitType,
    filterPaidBy,
    setFilterPaidBy,
    filterFromDate,
    setFilterFromDate,
    filterToDate,
    setFilterToDate,
    filterDatePreset,
    handleDatePresetChange,
    filterMinAmount,
    setFilterMinAmount,
    filterMaxAmount,
    setFilterMaxAmount,
    handleResetFilters: originalResetFilters,
  } = filterProps;

  // Wrap every filter setter to atomically reset the page to 1.
  // React 18 batches both state updates into a single re-render.
  const wrappedFilterProps = {
    ...filterProps,
    setFilterDescription: (v) => {
      setFilterDescription(v);
      setCurrentPage(1);
    },
    setFilterSplitType: (v) => {
      setFilterSplitType(v);
      setCurrentPage(1);
    },
    setFilterPaidBy: (v) => {
      setFilterPaidBy(v);
      setCurrentPage(1);
    },
    setFilterFromDate: (v) => {
      setFilterFromDate(v);
      setCurrentPage(1);
    },
    setFilterToDate: (v) => {
      setFilterToDate(v);
      setCurrentPage(1);
    },
    handleDatePresetChange: (preset) => {
      handleDatePresetChange(preset);
      setCurrentPage(1);
    },
    setFilterMinAmount: (v) => {
      setFilterMinAmount(v);
      setCurrentPage(1);
    },
    setFilterMaxAmount: (v) => {
      setFilterMaxAmount(v);
      setCurrentPage(1);
    },
    handleResetFilters: () => {
      originalResetFilters();
      setCurrentPage(1);
    },
  };

  // Sync all filter state + current page to the URL.
  // Uses { replace: true } so filter changes/keystrokes don't spam browser history.
  // Params equal to their default value are omitted so the clean URL stays param-free.
  useEffect(() => {
    const params = {};
    if (filterDescription) params.q = filterDescription;
    if (filterSplitType !== "all") params.split = filterSplitType;
    if (filterPaidBy !== "all") params.payer = filterPaidBy;
    if (filterDatePreset !== "all") params.preset = filterDatePreset;
    // Only persist from/to for the "custom" preset; all other presets recalculate
    // their date windows from the current date on load, so storing them would stale.
    if (filterDatePreset === "custom") {
      if (filterFromDate) params.from = filterFromDate;
      if (filterToDate) params.to = filterToDate;
    }
    if (filterMinAmount) params.min = filterMinAmount;
    if (filterMaxAmount) params.max = filterMaxAmount;
    if (currentPage !== 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [
    filterDescription,
    filterSplitType,
    filterPaidBy,
    filterDatePreset,
    filterFromDate,
    filterToDate,
    filterMinAmount,
    filterMaxAmount,
    currentPage,
    setSearchParams,
  ]);

  // Pagination calculations
  const totalExpenses = filteredExpenses.length;
  const { totalPages, safePage, startIdx, endIdx, showingFrom, showingTo } =
    usePagination(totalExpenses, EXPENSES_PER_PAGE, currentPage);
  const pagedExpenses = filteredExpenses.slice(startIdx, endIdx);

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
    deleteExpenseMutation.mutate({ groupId: selectedGroupId, expenseId });
  };

  const hasData =
    groupQuery.data !== undefined && expensesQuery.data !== undefined;
  const showSkeleton = isDataLoading || (isError && !hasData);

  return (
    <div className="flex flex-col gap-8">
      {isError && (
        <div className="flex min-h-24 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-center shadow-sm">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Couldn't load expenses.
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
      <div className="flex flex-col gap-4">
        {/* Static page heading */}
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Expenses
          </h1>
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
            Review and manage all your shared expenses
          </p>
        </div>

        <ExpenseFilters
          filterProps={wrappedFilterProps}
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
                      <td className="px-4 py-4.5">
                        <Skeleton className="ml-auto h-4 w-8" />
                      </td>
                    </tr>
                  ))
                ) : pagedExpenses && pagedExpenses.length > 0 ? (
                  pagedExpenses.map((expense) => (
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
                        <td className="px-4 py-1 text-right">
                          <button
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
                            className="rounded-DEFAULT p-2 text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete Expense"
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
                      className="h-13 px-4 text-center text-body-md text-on-surface-variant"
                    >
                      {selectedGroupId
                        ? expenses.length > 0
                          ? "No expenses match the selected filters."
                          : "Add expenses to get started."
                        : "Select a group to view expenses."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar — only rendered when there are enough results to paginate */}
          {!showSkeleton && totalExpenses > EXPENSES_PER_PAGE && (
            <Pagination
              safePage={safePage}
              totalPages={totalPages}
              showingFrom={showingFrom}
              showingTo={showingTo}
              totalItems={totalExpenses}
              itemLabel="expenses"
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
