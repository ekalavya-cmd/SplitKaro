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
    <div className="mb-6 flex flex-col gap-4">
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col">
        {/* Top row: Minimalist Filters Container */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
          <div className="relative flex flex-1 items-center">
            <span className="material-symbols-outlined pointer-events-none absolute left-2 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              id="filterDescription"
              placeholder="Search expenses..."
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="w-full bg-transparent py-2 pr-4 pl-10 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>

          <div className="mx-2 hidden h-8 w-px bg-outline-variant sm:block"></div>

          <div className="flex shrink-0 items-center gap-4 pr-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="splitType"
                className="text-body-md whitespace-nowrap text-on-surface-variant"
              >
                Split type:
              </label>
              <select
                name="splitType"
                id="splitType"
                value={filterSplitType}
                onChange={(e) => setFilterSplitType(e.target.value)}
                className="cursor-pointer rounded-DEFAULT border border-outline-variant bg-surface-container-low px-2 py-1 font-body-md text-body-md font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="equal">Equal</option>
                <option value="exact">Exact</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="paidBy"
                className="text-body-md whitespace-nowrap text-on-surface-variant"
              >
                Payer:
              </label>
              <select
                name="paidBy"
                id="paidBy"
                value={filterPaidBy}
                onChange={(e) => setFilterPaidBy(e.target.value)}
                className="max-w-30 cursor-pointer truncate rounded-DEFAULT border border-outline-variant bg-surface-container-low px-2 py-1 font-body-md text-body-md font-bold text-on-surface focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="all">All</option>
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No members</option>
                )}
              </select>
            </div>

            <div className="mx-2 hidden h-8 w-px bg-outline-variant sm:block"></div>

            <button
              type="button"
              onClick={() =>
                setIsAdvancedFiltersExpanded(!isAdvancedFiltersExpanded)
              }
              className="group flex cursor-pointer items-center gap-1 font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant transition-colors hover:text-primary focus:outline-none"
            >
              <span>Advanced Filters</span>
              {!isAdvancedFiltersExpanded && activeAdvancedFiltersCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-normal text-on-primary lowercase">
                  {activeAdvancedFiltersCount} active
                </span>
              )}
              <span
                className={`material-symbols-outlined transform text-[16px] transition-transform duration-300 ${isAdvancedFiltersExpanded ? "rotate-180" : ""}`}
              >
                expand_more
              </span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Section */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isAdvancedFiltersExpanded
              ? "mt-4 max-h-125 opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex w-full flex-wrap items-end gap-4">
              {/* Date range filters */}
              <div className="flex min-w-35 flex-1 flex-col">
                <label
                  htmlFor="datePreset"
                  className="mb-2 font-label-sm text-label-sm text-on-surface-variant"
                >
                  Date Range Preset
                </label>
                <select
                  id="datePreset"
                  value={filterDatePreset}
                  onChange={(e) => handleDatePresetChange(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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

              <div className="flex min-w-40 flex-1 flex-col">
                <label
                  htmlFor="fromDate"
                  className="mb-2 font-label-sm text-label-sm text-on-surface-variant"
                >
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
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex min-w-40 flex-1 flex-col">
                <label
                  htmlFor="toDate"
                  className="mb-2 font-label-sm text-label-sm text-on-surface-variant"
                >
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
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Amount range filters */}
              <div className="flex min-w-35 flex-1 flex-col">
                <label
                  htmlFor="minAmount"
                  className="mb-2 font-label-sm text-label-sm text-on-surface-variant"
                >
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  id="minAmount"
                  placeholder="Min amount"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  className={`h-10 w-full rounded-lg border bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 ${
                    isAmountRangeInvalid
                      ? "border-error"
                      : "border-outline-variant focus:border-primary"
                  }`}
                />
              </div>

              <div className="flex min-w-35 flex-1 flex-col">
                <label
                  htmlFor="maxAmount"
                  className="mb-2 font-label-sm text-label-sm text-on-surface-variant"
                >
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  id="maxAmount"
                  placeholder="Max amount"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  className={`h-10 w-full rounded-lg border bg-surface-container-lowest px-4 font-body-md text-body-md text-on-surface outline-none focus:ring-2 focus:ring-primary/20 ${
                    isAmountRangeInvalid
                      ? "border-error"
                      : "border-outline-variant focus:border-primary"
                  }`}
                />
              </div>

              <div className="min-w-35 flex-1 md:flex-initial">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-DEFAULT border border-primary bg-transparent px-6 font-body-md text-body-md font-semibold text-primary transition-all hover:bg-primary/5 hover:shadow-md"
                >
                  Reset Filters
                </button>
              </div>

              {isAmountRangeInvalid && (
                <div className="mt-2 w-full font-label-sm text-label-sm text-error">
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
