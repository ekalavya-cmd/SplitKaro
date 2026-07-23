import api from "../api/http.client";
import { setAccessToken, clearAccessToken } from "../api/token.store";

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

export const refresh = async () => {
  try {
    const response = await api.post("/auth/refresh");
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    clearAccessToken();
    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const logoutAll = async () => {
  try {
    const response = await api.post("/auth/logout-all");
    clearAccessToken();
    return response.data;
  } catch (error) {
    console.error("Error logging out from all devices:", error);
    throw error;
  }
};
