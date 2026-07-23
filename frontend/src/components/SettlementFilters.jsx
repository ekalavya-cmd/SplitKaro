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
    isAdvancedFiltersExpanded,
    setIsAdvancedFiltersExpanded,
    activeAdvancedFiltersCount,
    handleResetFilters,
  } = filterProps;

  return (
    <div className="mb-6 flex flex-col gap-4">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col">
        {/* Top row: Minimalist Filters Container */}
        <div className="flex flex-wrap items-center justify-start gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
          <div className="flex items-center gap-2 pl-2">
            <label
              htmlFor="settlFilterPaidBy"
              className="text-body-md whitespace-nowrap text-on-surface-variant"
            >
              Paid By:
            </label>
            <select
              id="settlFilterPaidBy"
              value={filterPaidBy}
              onChange={(e) => setFilterPaidBy(e.target.value)}
              className="max-w-[150px] cursor-pointer truncate rounded-DEFAULT border border-outline-variant bg-surface-container-low px-2 py-1 font-body-md text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
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

          <div className="flex items-center gap-2 pr-2">
            <label
              htmlFor="settlFilterPaidTo"
              className="text-body-md whitespace-nowrap text-on-surface-variant"
            >
              Paid To:
            </label>
            <select
              id="settlFilterPaidTo"
              value={filterPaidTo}
              onChange={(e) => setFilterPaidTo(e.target.value)}
              className="max-w-[150px] cursor-pointer truncate rounded-DEFAULT border border-outline-variant bg-surface-container-low px-2 py-1 font-body-md text-body-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
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

          <button
            type="button"
            onClick={() => setIsAdvancedFiltersExpanded(!isAdvancedFiltersExpanded)}
            className="group ml-auto flex cursor-pointer items-center gap-1 font-label-sm text-label-sm tracking-wider text-on-surface-variant transition-colors hover:text-primary focus:outline-none"
          >
            <span className="font-bold">Advanced Filters</span>
            {!isAdvancedFiltersExpanded && activeAdvancedFiltersCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-normal text-on-primary lowercase">
                {activeAdvancedFiltersCount} active
              </span>
            )}
            <span
              className={`material-symbols-outlined transform text-[16px] transition-transform duration-300 ${
                isAdvancedFiltersExpanded ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>
        </div>

        <div
            className={`overflow-hidden transition-all duration-300 ${
              isAdvancedFiltersExpanded
                ? "mt-4 max-h-[500px] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <div className="flex w-full flex-wrap items-end gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
              {/* Date Preset */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label
                  htmlFor="settlDatePreset"
                  className="mb-2 text-label-sm font-label-sm text-on-surface-variant"
                >
                  Date Range Preset
                </label>
                <select
                  id="settlDatePreset"
                  value={filterDatePreset}
                  onChange={(e) => handleDatePresetChange(e.target.value)}
                  className="w-full h-10 cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
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
                  className="mb-2 text-label-sm font-label-sm text-on-surface-variant"
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
                  className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {/* To Date */}
              <div className="flex min-w-[160px] flex-1 flex-col">
                <label
                  htmlFor="settlToDate"
                  className="mb-2 text-label-sm font-label-sm text-on-surface-variant"
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
                  className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {/* Reset Filters */}
              <div className="min-w-[140px] flex-1 md:flex-initial">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-DEFAULT border border-primary bg-transparent px-6 h-10 text-body-md font-body-md font-medium text-primary transition-all hover:bg-primary/5 hover:shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
      </form>
    </div>
  );
};
