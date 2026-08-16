import React from "react";
import { createPortal } from "react-dom";

export const ErrorBlock = ({ error, refetch }) => {
  const container = document.getElementById("toast-stack-container");

  const bannerContent = (
    <div
      className={`flex w-80 items-center gap-3 rounded-lg border border-error/30 bg-error-container px-4 py-3 text-on-error-container shadow-[0px_10px_15px_rgba(0,0,0,0.1)] ${
        container ? "pointer-events-auto" : "fixed bottom-6 right-6 z-50"
      }`}
    >
      <span className="material-symbols-outlined shrink-0 text-[20px] text-on-error-container">
        error
      </span>
      <p className="flex-1 font-label-sm text-label-sm leading-snug">
        {error?.message || "Failed to load data"}
      </p>
      {refetch && (
        <button
          onClick={(e) => {
            e.preventDefault();
            refetch();
          }}
          className="-mr-1 shrink-0 rounded-DEFAULT p-1 font-label-sm text-label-sm font-semibold underline underline-offset-2 transition-colors hover:bg-error/20"
        >
          Retry
        </button>
      )}
    </div>
  );

  if (!container) return bannerContent;
  return createPortal(bannerContent, container);
};
