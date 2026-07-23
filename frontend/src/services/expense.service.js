import api from "../api/http.client";

export const createExpense = async (groupId, expenseData) => {
  try {
    const response = await api.post(`/groups/${groupId}/expenses`, expenseData);
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

export const getExpenses = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/expenses`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

export const deleteExpense = async (groupId, expenseId) => {
  try {
    await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};
