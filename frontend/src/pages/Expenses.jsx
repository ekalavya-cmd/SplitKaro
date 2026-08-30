import React, { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useGroupQuery } from "../queries/useGroupsQueries";
import { useExpensesQuery } from "../queries/useExpensesQueries";
import { useExpenseFilters } from "../hooks/useExpenseFilters";
import { ExpenseFilters } from "../components/ExpenseFilters";
import { Pagination } from "../components/Pagination";
import { Skeleton } from "../components/Skeleton";
import { usePageLoadingState } from "../hooks/usePageLoadingState";
import { usePagination } from "../hooks/usePagination";
import { calculatePresetDates } from "../utils/dateFilters";
import { ExpenseTable } from "../components/ExpenseTable";

const EXPENSES_PER_PAGE = 10;

const Expenses = () => {
  const { selectedGroupId } = useOutletContext();
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
          <ExpenseTable
            expenses={pagedExpenses}
            isLoading={showSkeleton}
            showActions={true}
            groupId={selectedGroupId}
            emptyStateMessage={
              selectedGroupId
                ? expenses.length > 0
                  ? "No expenses match the selected filters."
                  : "Add expenses to get started."
                : "Select a group to view expenses."
            }
          />

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
