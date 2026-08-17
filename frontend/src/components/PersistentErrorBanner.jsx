import React from "react";
import { createPortal } from "react-dom";

export const PersistentErrorBanner = ({
  error,
  refetch,
  variant = "banner",
}) => {
  const isConnection = variant === "connection";
  const container = isConnection
    ? null
    : document.getElementById("toast-stack-container");

  const message = isConnection ? (
    <>Can&apos;t reach the server &mdash; retrying&hellip;</>
  ) : (
    error?.message || "Failed to load data"
  );

  const bannerContent = (
    <div
      className={`flex items-center gap-3 border-error/30 bg-error-container text-on-error-container shadow-[0px_10px_15px_rgba(0,0,0,0.1)] ${
        isConnection
          ? "fixed top-16 right-0 left-0 z-20 border-b px-6 py-2.5"
          : `w-80 rounded-lg border px-4 py-3 ${
              container ? "pointer-events-auto" : "fixed right-6 bottom-6 z-50"
            }`
      }`}
    >
      <span className="material-symbols-outlined shrink-0 text-[20px] text-on-error-container">
        error
      </span>

      <p className="flex-1 font-label-sm text-label-sm leading-snug">
        {message}
      </p>

      {refetch && (
        <button
          onClick={(e) => {
            e.preventDefault();
            refetch();
          }}
          className={`shrink-0 rounded-DEFAULT font-label-sm text-label-sm font-semibold underline underline-offset-2 transition-colors hover:bg-error/20 ${
            isConnection ? "ml-4 px-2 py-1" : "-mr-1 p-1"
          }`}
        >
          {isConnection ? "Retry now" : "Retry"}
        </button>
      )}
    </div>
  );

  if (isConnection || !container) {
    return bannerContent;
  }

  return createPortal(bannerContent, container);
};
