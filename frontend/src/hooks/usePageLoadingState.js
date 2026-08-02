import { useCallback } from "react";
import { useOutletContext } from "react-router-dom";

export const usePageLoadingState = (queries) => {
  const context = useOutletContext() || {};
  const { isInitializing, hasConnectionError, groupsIsLoading } = context;

  const isQueriesLoading = queries.some((q) => q.isLoading);
  const isDataLoading =
    isInitializing || hasConnectionError || groupsIsLoading || isQueriesLoading;
    
  const isError = !isDataLoading && queries.some((q) => q.isError);
  const errors = queries.map((q) => q.error).filter(Boolean);

  const refetchAll = useCallback(() => {
    queries.forEach((q) => {
      if (typeof q.refetch === "function") {
        q.refetch();
      }
    });
  }, [queries]);

  return { isDataLoading, isError, errors, refetchAll };
};
