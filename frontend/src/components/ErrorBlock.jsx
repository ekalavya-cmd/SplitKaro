import React from "react";

export const ErrorBlock = ({ error, refetch }) => (
  <div className="flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-error-container p-6 text-on-error-container">
    <p className="font-body-md text-body-md">
      Error: {error?.message || "Failed to load data"}
    </p>
    {refetch && (
      <button
        onClick={(e) => {
          e.preventDefault();
          refetch();
        }}
        className="rounded-DEFAULT bg-error px-4 py-2 font-label-sm text-label-sm text-on-error hover:opacity-90"
      >
        Retry
      </button>
    )}
  </div>
);
