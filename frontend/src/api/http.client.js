import axios from "axios";
import { getAccessToken } from "./token.store";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

httpClient.interceptors.request.use(
  async (config) => {
    // TEMPORARY DEV-ONLY ARTIFICIAL DELAY — for visually testing loading-state UI. REMOVE before considering this done — do not let this ship.
    if (import.meta.env.DEV) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject({
        status,
        message: data?.message || "Something went wrong",
      });
    }

    return Promise.reject({
      status: 0,
      message: "Network error",
    });
  },
);

export default httpClient;
