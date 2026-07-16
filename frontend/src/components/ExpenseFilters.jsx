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
    <div className="rounded-xl border border-canvas-soft bg-canvas p-lg shadow-sm">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-lg">
        {/* Top row: Primary Filters */}
        <div className="grid grid-cols-1 gap-md md:grid-cols-3">
          <div className="flex flex-col">
            <label
              htmlFor="filterDescription"
              className="mb-xs text-body-sm-strong text-ink"
            >
              Search Description
            </label>
            <input
              type="text"
              id="filterDescription"
              placeholder="Search expenses..."
              value={filterDescription}
              onChange={(e) => setFilterDescription(e.target.value)}
              className="w-full rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="splitType"
              className="mb-xs text-body-sm-strong text-ink"
            >
              Split Type
            </label>
            <select
              name="splitType"
              id="splitType"
              value={filterSplitType}
              onChange={(e) => setFilterSplitType(e.target.value)}
              className="w-full cursor-pointer rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
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
              className="mb-xs text-body-sm-strong text-ink"
            >
              Paid By
            </label>
            <select
              name="paidBy"
              id="paidBy"
              value={filterPaidBy}
              onChange={(e) => setFilterPaidBy(e.target.value)}
              className="w-full cursor-pointer rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
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
              {!isAdvancedFiltersExpanded &&
                activeAdvancedFiltersCount > 0 && (
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
              {/* Date range filters */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label
                  htmlFor="datePreset"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  Date Range Preset
                </label>
                <select
                  id="datePreset"
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

              <div className="flex min-w-[160px] flex-1 flex-col">
                <label
                  htmlFor="fromDate"
                  className="mb-xs text-body-sm-strong text-ink"
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
                  className="w-full rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex min-w-[160px] flex-1 flex-col">
                <label
                  htmlFor="toDate"
                  className="mb-xs text-body-sm-strong text-ink"
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
                  className="w-full rounded-md border border-ink bg-canvas px-lg py-md text-body-md text-ink focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Amount range filters */}
              <div className="flex min-w-[140px] flex-1 flex-col">
                <label
                  htmlFor="minAmount"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  id="minAmount"
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

              <div className="flex min-w-[140px] flex-1 flex-col">
                <label
                  htmlFor="maxAmount"
                  className="mb-xs text-body-sm-strong text-ink"
                >
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  id="maxAmount"
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
