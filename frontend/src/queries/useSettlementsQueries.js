import { useQuery } from "@tanstack/react-query";
import { getSettlements, getSettlementSuggestions } from "../services/settlement.service";
import { queryKeys } from "./queryKeys";

export const useSettlementsQuery = (groupId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.settlements.list(groupId),
    queryFn: () => getSettlements(groupId),
    enabled: !!groupId,
    ...options,
  });
};

export const useSettlementSuggestionsQuery = (groupId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.settlements.suggest(groupId),
    queryFn: () => getSettlementSuggestions(groupId),
    enabled: !!groupId,
    ...options,
  });
};
