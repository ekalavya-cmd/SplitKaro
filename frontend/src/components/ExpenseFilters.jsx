import React from "react";

export const ExpenseFilters = ({ filterProps, members }) => {
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
    setFilterDatePreset,
    filterMinAmount,
    setFilterMinAmount,
    filterMaxAmount,
    setFilterMaxAmount,
    isAdvancedFiltersExpanded,
    setIsAdvancedFiltersExpanded,
    handleDatePresetChange,
    handleResetFilters,
    isAmountRangeInvalid,
    activeAdvancedFiltersCount,
  } = filterProps;

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
        {/* Top row: Primary Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col">
            <label
              htmlFor="filterDescription"
              className="mb-2 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider"
            >
              Search Description
            </label>
            <input
              type="text"
              id="filterDescription"
              placeholder="Search expenses..."
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow outline-none placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="splitType"
              className="mb-2 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider"
            >
              Split Type
            </label>
            <select
              name="splitType"
              id="splitType"
              value={filterSplitType}
              onChange={(e) => setFilterSplitType(e.target.value)}
              className="w-full h-10 cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow outline-none"
            >
              <option value="all">All Types</option>
              <option value="equal">Equal Split</option>
              <option value="exact">Exact Split</option>
              <option value="percentage">Percentage Split</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="paidBy"
              className="mb-2 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider"
            >
              Paid By
            </label>
            <select
              name="paidBy"
              id="paidBy"
              value={filterPaidBy}
              onChange={(e) => setFilterPaidBy(e.target.value)}
              className="w-full h-10 cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow outline-none"
            >
              <option value="all">All Payers</option>
              {members && members.length > 0 ? (
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

        {/* Advanced Filters Section */}
        <div className="border-t border-outline-variant pt-6">
          <button
            type="button"
            onClick={() => setIsAdvancedFiltersExpanded(!isAdvancedFiltersExpanded)}
            className="group flex w-full cursor-pointer items-center justify-between text-left text-label-sm font-label-sm tracking-wider text-on-surface-variant uppercase transition-colors hover:text-primary focus:outline-none"
          >
            <span className="flex items-center gap-2 font-bold">
              Advanced Filters
              {!isAdvancedFiltersExpanded && activeAdvancedFiltersCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-normal text-on-primary lowercase">
                  {activeAdvancedFiltersCount} active
                </span>
              )}
            </span>
            <span className={`material-symbols-outlined text-[18px] transform transition-transform duration-300 ${isAdvancedFiltersExpanded ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isAdvancedFiltersExpanded
                ? "mt-4 max-h-[500px] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <div className="flex w-full flex-wrap items-end gap-4">
              {/* Date range filters */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label htmlFor="datePreset" className="mb-2 text-label-sm font-label-sm text-on-surface-variant">
                  Date Range Preset
                </label>
                <select
                  id="datePreset"
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

              <div className="flex min-w-[160px] flex-1 flex-col">
                <label htmlFor="fromDate" className="mb-2 text-label-sm font-label-sm text-on-surface-variant">
                  From Date
                </label>
                <input
                  type="date"
                  id="fromDate"
                  value={filterFromDate}
                  onChange={(e) => {
                    setFilterFromDate(e.target.value);
                    setFilterDatePreset("custom");
                  }}
                  className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex min-w-[160px] flex-1 flex-col">
                <label htmlFor="toDate" className="mb-2 text-label-sm font-label-sm text-on-surface-variant">
                  To Date
                </label>
                <input
                  type="date"
                  id="toDate"
                  value={filterToDate}
                  onChange={(e) => {
                    setFilterToDate(e.target.value);
                    setFilterDatePreset("custom");
                  }}
                  className="w-full h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {/* Amount range filters */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label htmlFor="minAmount" className="mb-2 text-label-sm font-label-sm text-on-surface-variant">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  id="minAmount"
                  placeholder="Min amount"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  className={`w-full h-10 rounded-lg border bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${
                    isAmountRangeInvalid ? "border-error" : "border-outline-variant focus:border-primary"
                  }`}
                />
              </div>

              <div className="flex min-w-[140px] flex-1 flex-col">
                <label htmlFor="maxAmount" className="mb-2 text-label-sm font-label-sm text-on-surface-variant">
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  id="maxAmount"
                  placeholder="Max amount"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  className={`w-full h-10 rounded-lg border bg-surface-container-lowest px-4 text-body-md font-body-md text-on-surface focus:ring-2 focus:ring-primary/20 outline-none ${
                    isAmountRangeInvalid ? "border-error" : "border-outline-variant focus:border-primary"
                  }`}
                />
              </div>

              <div className="min-w-[140px] flex-1 md:flex-initial">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface px-6 h-10 text-body-md font-body-md font-medium text-on-surface transition-colors hover:bg-surface-variant"
                >
                  Reset Filters
                </button>
              </div>

              {isAmountRangeInvalid && (
                <div className="mt-2 w-full text-label-sm font-label-sm text-error">
                  ⚠️ Min amount cannot exceed Max amount. Amount filter is currently ignored.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
