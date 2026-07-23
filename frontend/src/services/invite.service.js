import api from "../api/http.client";

export const getGroupByInviteToken = async (token) => {
  try {
    const response = await api.get(`/groups/invite/${token}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group by invite token:", error);
    throw error;
  }
};

export const joinGroupViaInvite = async (token) => {
  try {
    const response = await api.post(`/groups/invite/${token}/join`);
    return response.data;
  } catch (error) {
    console.error("Error joining group via invite:", error);
    throw error;
  }
};
