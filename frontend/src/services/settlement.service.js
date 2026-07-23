import api from "../api/http.client";

export const getBalances = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/balances`);
    return response.data;
  } catch (error) {
    console.error("Error fetching balances:", error);
    throw error;
  }
};

export const getSettlementSuggestions = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/settlements/suggest`);
    return response.data.suggestions;
  } catch (error) {
    console.error("Error fetching settlement suggestions:", error);
    throw error;
  }
};

export const getSettlements = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/settlements`);
    return response.data;
  } catch (error) {
    console.error("Error fetching settlements:", error);
    throw error;
  }
};

export const createSettlement = async (groupId, settlementData) => {
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

export const deleteSettlement = async (settlementId) => {
  try {
    await api.delete(`/groups/settlements/${settlementId}`);
  } catch (error) {
    console.error("Error deleting settlement:", error);
    throw error;
  }
};
