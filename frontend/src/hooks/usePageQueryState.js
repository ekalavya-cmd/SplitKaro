import { useCallback } from "react";

export const usePageQueryState = (queries) => {
  const isLoading = queries.some((q) => q.isLoading);
  const isError = !isLoading && queries.some((q) => q.isError);
  const errors = queries.map((q) => q.error).filter(Boolean);

  const refetchAll = useCallback(() => {
    queries.forEach((q) => {
      if (typeof q.refetch === "function") {
        q.refetch();
      }
    });
  }, [queries]); // queries array will be a new reference each render if passed inline, but it's fine for refetch calls which just execute

  return { isLoading, isError, errors, refetchAll };
};
