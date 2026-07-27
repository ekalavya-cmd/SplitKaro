import React from "react";

export const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded bg-surface-container-high ${className}`}
    />
  );
};
