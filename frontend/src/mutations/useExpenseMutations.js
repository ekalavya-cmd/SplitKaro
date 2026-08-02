import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, deleteExpense } from "../services/expense.service";
import { queryKeys } from "../queries/queryKeys";

export const useCreateExpense = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, inputs }) => createExpense(groupId, inputs),
    onSuccess: (data, variables, context) => {
      alert("Expense added successfully!");
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.suggest(variables.groupId) });
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error("Error creating expense:", error);
      alert("Failed to add expense. Please try again.");
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};

export const useDeleteExpense = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, expenseId }) => deleteExpense(groupId, expenseId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balances.list(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.suggest(variables.groupId) });
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
      
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    ...options,
  });
};
