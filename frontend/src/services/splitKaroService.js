import api from "../api/splitKaroAPI";

const getGroups = async () => {
  try {
    const response = await api.get("/groups");
    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

const getGroup = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error;
  }
};

const createGroup = async (groupData) => {
  try {
    const response = await api.post("/groups", groupData);
    return response.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};

const createExpense = async (groupId, expenseData) => {
  try {
    const response = await api.post(`/groups/${groupId}/expenses`, expenseData);
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw error;
  }
};

const getExpenses = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/expenses`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

const deleteExpense = async (expenseId) => {
  try {
    await api.delete(`/expenses/${expenseId}`);
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

const getBalances = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/balances`);
    return response.data;
  } catch (error) {
    console.error("Error fetching balances:", error);
    throw error;
  }
};

const getSettlementSuggestions = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/settlements/suggest`);
    return response.data;
  } catch (error) {
    console.error("Error fetching settlement suggestions:", error);
    throw error;
  }
};

const getSettlements = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/settlements`);
    return response.data;
  } catch (error) {
    console.error("Error fetching settlements:", error);
    throw error;
  }
};

const createSettlement = async (groupId, settlementData) => {
  try {
    const response = await api.post(
      `/groups/${groupId}/settlements`,
      settlementData,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating settlement:", error);
    throw error;
  }
};

const deleteSettlement = async (settlementId) => {
  try {
    await api.delete(`/settlements/${settlementId}`);
  } catch (error) {
    console.error("Error deleting settlement:", error);
    throw error;
  }
};

export {
  getGroups,
  getGroup,
  createGroup,
  createExpense,
  getExpenses,
  deleteExpense,
  getBalances,
  getSettlementSuggestions,
  getSettlements,
  createSettlement,
  deleteSettlement,
};
