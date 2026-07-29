import React from "react";

/**
 * Pagination — reusable presentational component for page navigation.
 *
 * Props:
 *   safePage    — the current clamped page number
 *   totalPages  — total number of pages
 *   showingFrom — start index of items being displayed
 *   showingTo   — end index of items being displayed
 *   totalItems  — total number of items available
 *   itemLabel   — string label for the items (e.g., "expenses", "settlements")
 *   onPageChange— callback fired when Prev/Next is clicked
 */
export const Pagination = ({
  safePage,
  totalPages,
  showingFrom,
  showingTo,
  totalItems,
  itemLabel,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3">
      <p className="font-label-sm text-label-sm text-on-surface-variant">
        Showing {showingFrom}&ndash;{showingTo} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="flex h-8 cursor-pointer items-center gap-1 rounded-DEFAULT border border-primary bg-transparent px-3 font-label-sm text-label-sm font-semibold text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_left
          </span>
          Prev
        </button>
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="flex h-8 cursor-pointer items-center gap-1 rounded-DEFAULT border border-primary bg-transparent px-3 font-label-sm text-label-sm font-semibold text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-on-surface-variant disabled:opacity-50"
        >
          Next
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
};
