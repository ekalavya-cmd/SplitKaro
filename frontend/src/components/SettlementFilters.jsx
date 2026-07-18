import React from "react";

/**
 * SettlementFilters — reusable filter UI for the settlement history table.
 *
 * Props:
 *   filterProps  — the full filterProps object returned by useSettlementFilters
 *   members      — the current group's members array (for Paid By / Paid To dropdowns)
 */
export const SettlementFilters = ({ filterProps, members = [] }) => {
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
    setFilterDatePreset,
    handleDatePresetChange,
    filterMinAmount,
    setFilterMinAmount,
    filterMaxAmount,
    setFilterMaxAmount,
    isAmountRangeInvalid,
    isAdvancedFiltersExpanded,
    setIsAdvancedFiltersExpanded,
    activeAdvancedFiltersCount,
    handleResetFilters,
  } = filterProps;

  return (
    <div className="rounded-xl border border-canvas-soft bg-canvas p-lg shadow-sm">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-lg">
        {/* Primary row: Paid By + Paid To */}
        <div className="grid grid-cols-1 gap-md md:grid-cols-2">
          <div className="flex flex-col">
            <label
              htmlFor="settlFilterPaidBy"
              className="mb-xs text-body-sm-strong text-ink"
            >
              Paid By
            </label>
            <select
              id="settlFilterPaidBy"
              value={filterPaidBy}
              onChange={(e) => setFilterPaidBy(e.target.value)}
              className="w-full cursor-pointer rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Payers</option>
              {members.length > 0 ? (
                members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))
              ) : (
                <option disabled>No members available</option>
              )}
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="settlFilterPaidTo"
              className="mb-xs text-body-sm-strong text-ink"
            >
              Paid To
            </label>
            <select
              id="settlFilterPaidTo"
              value={filterPaidTo}
              onChange={(e) => setFilterPaidTo(e.target.value)}
              className="w-full cursor-pointer rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">All Payees</option>
              {members.length > 0 ? (
                members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))
              ) : (
                <option disabled>No members available</option>
              )}
            </select>
          </div>
        </div>

        {/* Advanced Filters collapsible section */}
        <div className="border-t border-canvas-soft pt-lg">
          <button
            type="button"
            onClick={() =>
              setIsAdvancedFiltersExpanded(!isAdvancedFiltersExpanded)
            }
            className="group flex w-full cursor-pointer items-center justify-between text-left text-body-sm-strong tracking-wider text-ink uppercase transition-colors hover:text-primary focus:outline-none"
          >
            <span className="flex items-center gap-xs font-bold">
              Advanced Filters
              {!isAdvancedFiltersExpanded && activeAdvancedFiltersCount > 0 && (
                <span className="rounded-full bg-primary px-md py-xxs text-[10px] font-bold tracking-normal text-on-primary lowercase">
                  {activeAdvancedFiltersCount} active
                </span>
              )}
            </span>
            <span
              className={`transform font-bold transition-transform duration-300 ${
                isAdvancedFiltersExpanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isAdvancedFiltersExpanded
                ? "mt-md max-h-[500px] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <div className="flex w-full flex-wrap items-end gap-md">
              {/* Date Preset */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label
                  htmlFor="settlDatePreset"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  Date Range Preset
                </label>
                <select
                  id="settlDatePreset"
                  value={filterDatePreset}
                  onChange={(e) => handleDatePresetChange(e.target.value)}
                  className="w-full cursor-pointer rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="this-year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* From Date */}
              <div className="flex min-w-[160px] flex-1 flex-col">
                <label
                  htmlFor="settlFromDate"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  From Date
                </label>
                <input
                  type="date"
                  id="settlFromDate"
                  value={filterFromDate}
                  onChange={(e) => {
                    setFilterFromDate(e.target.value);
                    setFilterDatePreset("custom");
                  }}
                  className="w-full rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* To Date */}
              <div className="flex min-w-[160px] flex-1 flex-col">
                <label
                  htmlFor="settlToDate"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  To Date
                </label>
                <input
                  type="date"
                  id="settlToDate"
                  value={filterToDate}
                  onChange={(e) => {
                    setFilterToDate(e.target.value);
                    setFilterDatePreset("custom");
                  }}
                  className="w-full rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Min Amount */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label
                  htmlFor="settlMinAmount"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  id="settlMinAmount"
                  placeholder="Min amount"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  className={`w-full rounded-md border bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none ${
                    isAmountRangeInvalid
                      ? "border-negative-deep"
                      : "border-ink"
                  }`}
                />
              </div>

              {/* Max Amount */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label
                  htmlFor="settlMaxAmount"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  id="settlMaxAmount"
                  placeholder="Max amount"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  className={`w-full rounded-md border bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none ${
                    isAmountRangeInvalid
                      ? "border-negative-deep"
                      : "border-ink"
                  }`}
                />
              </div>

              {/* Reset Filters */}
              <div className="min-w-[140px] flex-1 md:flex-initial">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex w-full cursor-pointer items-center justify-center gap-xs rounded-xl border border-ink/20 bg-canvas-soft px-xl py-md text-button-md font-semibold text-body transition-colors hover:bg-canvas-soft/80"
                >
                  Reset Filters
                </button>
              </div>

              {isAmountRangeInvalid && (
                <div className="mt-xs w-full text-body-sm font-semibold text-negative-deep">
                  ⚠️ Min amount cannot exceed Max amount. Amount filter is
                  currently ignored.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
