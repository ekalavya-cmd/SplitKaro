import { useQuery } from "@tanstack/react-query";
import { getExpenses } from "../services/expense.service";
import { queryKeys } from "./queryKeys";

export const useExpensesQuery = (groupId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.expenses.list(groupId),
    queryFn: async () => {
      const data = await getExpenses(groupId);
      return data.expenses || [];
    },
    enabled: !!groupId,
    ...options,
  });
};
