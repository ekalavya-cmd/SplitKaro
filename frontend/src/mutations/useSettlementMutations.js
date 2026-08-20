import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSettlement,
  deleteSettlement,
} from "../services/settlement.service";
import { queryKeys } from "../queries/queryKeys";
import { useToast } from "../context/useToast";

export const useCreateSettlement = (options = {}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ groupId, payload, inputs }) =>
      createSettlement(groupId, payload || inputs),
    onSuccess: (data, variables, context) => {
      showToast({
        type: "success",
        message: data?.message ?? "Settlement recorded successfully",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.balances.list(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlements.list(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlements.suggest(variables.groupId),
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options.onError) {
        options.onError(error, variables, context);
      } else {
        showToast({
          type: "error",
          message: error?.message ?? "Failed to record settlement. Please try again.",
        });
      }
    },
  });
};

export const useDeleteSettlement = (options = {}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ groupId, settlementId }) =>
      deleteSettlement(settlementId, groupId),
    onSuccess: (data, variables, context) => {
      showToast({
        type: "success",
        message: data?.message ?? "Settlement deleted successfully",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.balances.list(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlements.list(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.settlements.suggest(variables.groupId),
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error("Error deleting settlement:", error);
      showToast({
        type: "error",
        message: error?.message ?? "Something went wrong. Please try again.",
      });

      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
  });
};
