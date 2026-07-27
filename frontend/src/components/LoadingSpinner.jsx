import React from "react";

export const LoadingSpinner = ({ className = "" }) => (
  <div
    className={`flex w-full items-center justify-center p-8 ${className}`.trim()}
  >
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-primary"></div>
  </div>
);
