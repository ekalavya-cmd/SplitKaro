import React, { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useGroupQuery } from "../queries/useGroupsQueries";
import {
  useSettlementsQuery,
  useSettlementSuggestionsQuery,
} from "../queries/useSettlementsQueries";
import { useDeleteSettlement } from "../mutations/useSettlementMutations";
import { useSettlementFilters } from "../hooks/useSettlementFilters";
import { SettlementFilters } from "../components/SettlementFilters";
import { SimplifiedSettlements } from "../components/SimplifiedSettlements";
import { Pagination } from "../components/Pagination";
import { ErrorBlock } from "../components/ErrorBlock";
import { Skeleton } from "../components/Skeleton";
import { RecordSettlementModal } from "../components/RecordSettlementModal";
import { usePageLoadingState } from "../hooks/usePageLoadingState";
import { usePagination } from "../hooks/usePagination";
import {
  formatDateForDisplay,
  calculatePresetDates,
} from "../utils/dateFilters";

const SETTLEMENTS_PER_PAGE = 10;

const SettleUp = () => {
  const { selectedGroupId } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementModalData, setSettlementModalData] = useState(null);

  // Derive initial filter values from URL params.
  // useState only reads these on the first render; re-renders ignore them.
  const urlPreset = searchParams.get("preset") || "all";
  let initFromDate = searchParams.get("from") || "";
  let initToDate = searchParams.get("to") || "";
  // For non-custom presets, recalculate dates from the current date so
  // they are always fresh (e.g. "this-week" gives the correct week, not
  // stale stored dates). Only "custom" persists explicit from/to in URL.
  if (urlPreset !== "all" && urlPreset !== "custom") {
    const { fromDate, toDate } = calculatePresetDates(urlPreset);
    initFromDate = fromDate;
    initToDate = toDate;
  }
  const initialFilterValues = {
    filterPaidBy: searchParams.get("paidBy") || "all",
    filterPaidTo: searchParams.get("paidTo") || "all",
    filterDatePreset: urlPreset,
    filterFromDate: initFromDate,
    filterToDate: initToDate,
  };

  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const groupQuery = useGroupQuery(selectedGroupId);
  const group = groupQuery.data;

  const suggestionsQuery = useSettlementSuggestionsQuery(selectedGroupId);
  const suggestions = suggestionsQuery.data || [];

  const settlementsQuery = useSettlementsQuery(selectedGroupId);
  const settlementsData = settlementsQuery.data || { settlements: [] };

  const { isDataLoading, isError, errors, refetchAll } = usePageLoadingState([
    groupQuery,
    suggestionsQuery,
    settlementsQuery,
  ]);

  const { filteredSettlements, filterProps } = useSettlementFilters(
    settlementsData.settlements,
    initialFilterValues,
  );

  // Destructure filter state for URL sync effect and setter wrapping
  const {
    filterPaidBy,
    setFilterPaidBy,
    filterPaidTo,
    setFilterPaidTo,
    filterFromDate,
    setFilterFromDate,
    filterToDate,
    setFilterToDate,
    filterDatePreset,
    handleDatePresetChange,
    handleResetFilters: originalResetFilters,
  } = filterProps;

  // Wrap every filter setter to atomically reset page to 1.
  // React 18 batches both state updates into a single re-render.
  const wrappedFilterProps = {
    ...filterProps,
    setFilterPaidBy: (v) => {
      setFilterPaidBy(v);
      setCurrentPage(1);
    },
    setFilterPaidTo: (v) => {
      setFilterPaidTo(v);
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
    handleResetFilters: () => {
      originalResetFilters();
      setCurrentPage(1);
    },
  };

  // Sync all filter state + current page to the URL.
  // Uses { replace: true } so changes don't spam browser history.
  // Params equal to their default are omitted so the base URL stays clean.
  useEffect(() => {
    const params = {};
    if (filterPaidBy !== "all") params.paidBy = filterPaidBy;
    if (filterPaidTo !== "all") params.paidTo = filterPaidTo;
    if (filterDatePreset !== "all") params.preset = filterDatePreset;
    // Only persist from/to for the "custom" preset; all other presets
    // recalculate their window from the current date on load.
    if (filterDatePreset === "custom") {
      if (filterFromDate) params.from = filterFromDate;
      if (filterToDate) params.to = filterToDate;
    }
    if (currentPage !== 1) params.page = String(currentPage);
    setSearchParams(params, { replace: true });
  }, [
    filterPaidBy,
    filterPaidTo,
    filterDatePreset,
    filterFromDate,
    filterToDate,
    currentPage,
    setSearchParams,
  ]);

  // Pagination calculations
  const totalSettlements = filteredSettlements.length;
  const { totalPages, safePage, startIdx, endIdx, showingFrom, showingTo } =
    usePagination(totalSettlements, SETTLEMENTS_PER_PAGE, currentPage);
  const pagedSettlements = filteredSettlements.slice(startIdx, endIdx);

  const deleteSettlementMutation = useDeleteSettlement();

  if (isError) {
    return (
      <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6">
        <ErrorBlock
          error={{
            message:
              errors[0]?.message +
              (errors.length > 1
                ? ` (and ${errors.length - 1} other error${errors.length > 2 ? "s" : ""})`
                : ""),
          }}
          refetch={refetchAll}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left column: heading + Simplified Settlements + Settlements History */}
      <div className="flex flex-col gap-8 lg:col-span-2">
        {/* Settlements History */}
        <div className="flex flex-col gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Settlements History
          </h2>

          <SettlementFilters
            filterProps={wrappedFilterProps}
            members={group ? group.members : []}
          />

          <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    <th className="w-32 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Date
                    </th>
                    <th className="w-32 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Paid By
                    </th>
                    <th className="w-32 px-4 py-3 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Paid To
                    </th>
                    <th className="w-32 px-4 py-3 text-right font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {isDataLoading || settlementsQuery.isLoading ? (
                    Array.from({ length: 1 }).map((_, i) => (
                      <tr key={i} className="h-row-height-compact">
                        <td className="px-4 py-8">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-4 py-8">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-4 py-8">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-4 py-8 text-right">
                          <Skeleton className="ml-auto h-4 w-16" />
                        </td>
                      </tr>
                    ))
                  ) : pagedSettlements && pagedSettlements.length > 0 ? (
                    pagedSettlements.map((settlement) => (
                      <tr
                        key={settlement.id}
                        className="h-row-height-compact transition-colors hover:bg-surface-container-low/50"
                      >
                        <td className="px-4 py-2 font-mono-data text-sm whitespace-nowrap text-on-surface-variant">
                          {formatDateForDisplay(settlement.date)}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] text-on-secondary-container">
                              {settlement.payer.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="truncate font-body-md font-medium text-on-surface">
                              {settlement.payer.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-container font-label-sm text-[10px] text-on-secondary-container">
                              {settlement.payee.name
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="truncate font-body-md font-medium text-on-surface">
                              {settlement.payee.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right font-mono-data font-medium text-on-surface">
                          ₹{settlement.amount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="h-20 px-4 text-center text-body-md text-on-surface-variant"
                        colSpan="4"
                      >
                        {settlementsData.settlements.length > 0
                          ? "No settlements match the selected filters"
                          : "No settlements found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination bar — only shown when there are enough results to paginate */}
            {!isDataLoading &&
              !settlementsQuery.isLoading &&
              totalSettlements > SETTLEMENTS_PER_PAGE && (
                <Pagination
                  safePage={safePage}
                  totalPages={totalPages}
                  showingFrom={showingFrom}
                  showingTo={showingTo}
                  totalItems={totalSettlements}
                  itemLabel="settlements"
                  onPageChange={setCurrentPage}
                />
              )}
          </div>
        </div>
      </div>

      {/* Right column: Simplified Settlements + Record Settlement form */}
      <div className="flex flex-col gap-8 lg:col-span-1">
        <SimplifiedSettlements
          suggestions={suggestions}
          isLoading={isDataLoading || suggestionsQuery.isLoading}
          onSettle={(from, to, amount) => {
            setSettlementModalData({
              paid_by: from.id,
              paid_to: to.id,
              amount: amount.toFixed(2),
            });
            setIsSettlementModalOpen(true);
          }}
          showRecalculate={true}
          isFetching={suggestionsQuery.isFetching}
          onRecalculate={() => suggestionsQuery.refetch()}
        />
      </div>

      <RecordSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => {
          setIsSettlementModalOpen(false);
          setSettlementModalData(null);
        }}
        groupId={selectedGroupId}
        initialData={settlementModalData}
      />
    </div>
  );
};

export default SettleUp;
