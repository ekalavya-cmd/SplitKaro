import React from "react";
import { Skeleton } from "./Skeleton";

/**
 * SimplifiedSettlements — shared component rendering the suggested payment
 * list used on both the Dashboard and SettleUp pages.
 *
 * Props:
 *   suggestions       — array from the settlement suggestions query
 *   isLoading         — true while parent data is still loading
 *   onSettle          — called with (from, to, amount) when Settle is clicked;
 *                       each page supplies its own click logic (navigate vs setState)
 *   showRecalculate   — (optional, default false) show the Recalculate header button
 *   isFetching        — (optional, default false) disables the Recalculate button while fetching
 *   onRecalculate     — (optional) called when the Recalculate button is clicked
 */
export const SimplifiedSettlements = ({
  suggestions,
  isLoading,
  onSettle,
  showRecalculate = false,
  isFetching = false,
  onRecalculate = () => {},
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Section heading row — Recalculate button only shown on SettleUp */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Simplified Settlements
        </h2>
        {showRecalculate && (
          <button
            type="button"
            onClick={onRecalculate}
            disabled={isFetching}
            className="flex cursor-pointer items-center gap-1 font-label-sm text-label-sm text-primary transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">
              refresh
            </span>
            Recalculate
          </button>
        )}
      </div>

      {/* Loading skeleton — card-shaped placeholder */}
      {isLoading ? (
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-4.5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16 shrink-0 rounded-DEFAULT" />
          </div>
        </div>
      ) : suggestions && suggestions.length > 0 ? (
        /* Individual bordered card per suggestion */
        <div className="flex flex-col gap-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="font-body-md text-body-md text-on-surface">
                    <span className="font-semibold text-on-surface">
                      {suggestion.from.name}
                    </span>{" "}
                    pays{" "}
                    <span className="font-semibold text-on-surface">
                      {suggestion.to.name}
                    </span>
                  </p>
                  <p className="font-mono-data font-medium text-secondary">
                    ₹{suggestion.amount.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onSettle(suggestion.from, suggestion.to, suggestion.amount)
                  }
                  className="shrink-0 rounded-DEFAULT border border-primary bg-transparent px-3 py-1.5 font-label-sm text-label-sm font-semibold tracking-wide text-primary transition-all hover:bg-primary/5 hover:shadow-md"
                >
                  Settle
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state — bordered container for visual consistency with card style */
        <div className="flex min-h-19.5 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-center shadow-sm">
          <p className="font-body-md text-body-md text-on-surface-variant">
            All balances are settled!
          </p>
        </div>
      )}
    </div>
  );
};
