import { useQuery } from "@tanstack/react-query";
import { getBalances } from "../services/settlement.service";
import { queryKeys } from "./queryKeys";

export const useBalancesQuery = (groupId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.balances.list(groupId),
    queryFn: async () => {
      const data = await getBalances(groupId);
      return data.balances || [];
    },
    enabled: !!groupId,
    ...options,
  });
};
