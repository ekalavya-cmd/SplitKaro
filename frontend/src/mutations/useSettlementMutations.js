import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSettlement, deleteSettlement } from "../services/settlement.service";
import { queryKeys } from "../queries/queryKeys";

export const useCreateSettlement = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, payload, inputs }) => createSettlement(groupId, payload || inputs),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.suggest(variables.groupId) });
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export const useDeleteSettlement = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, settlementId }) => deleteSettlement(settlementId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.suggest(variables.groupId) });
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error("Error deleting settlement:", error);
      alert("Failed to delete settlement. Please try again.");
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
