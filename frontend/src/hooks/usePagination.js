export const usePagination = (totalItems, itemsPerPage, currentPage) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  // safePage clamps the stored page in case totalItems shrinks (e.g. from filtering)
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const showingFrom = totalItems === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(totalItems, endIdx);

  return {
    totalPages,
    safePage,
    startIdx,
    endIdx,
    showingFrom,
    showingTo,
  };
};
