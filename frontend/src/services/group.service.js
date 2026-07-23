import api from "../api/http.client";

export const getGroups = async () => {
  try {
    const response = await api.get("/groups");
    return response.data.groups;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
};

export const getGroup = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching group:", error);
    throw error;
  }
};

export const createGroup = async (groupData) => {
  try {
    const response = await api.post("/groups", groupData);
    return response.data;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
};
