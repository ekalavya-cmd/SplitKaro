import axios from "axios";
import { getAccessToken, setAccessToken } from "./token.store";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized (silent refresh and retry)
      if (
        status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url.startsWith("/auth/")
      ) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              return httpClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(
            "/auth/refresh",
            {},
            {
              baseURL: import.meta.env.VITE_API_URL,
              withCredentials: true,
            },
          );

          const newAccessToken = res.data.accessToken;
          setAccessToken(newAccessToken);

          originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          return httpClient(originalRequest);
        } catch (refreshError) {
          const authError = {
            status: 401,
            message: "Your session has expired. Please log in again.",
          };
          processQueue(authError);
          isRefreshing = false;

          window.dispatchEvent(new CustomEvent("auth:forceLogout"));

          return Promise.reject(authError);
        }
      }

      let errorMessage = data?.message || "Something went wrong";

      if (
        typeof errorMessage === "string" &&
        errorMessage.startsWith("Balance calculation error:")
      ) {
        errorMessage =
          "Something went wrong while calculating balances. Please refresh and try again.";
      }

      return Promise.reject({
        status,
        message: errorMessage,
      });
    }

    return Promise.reject({
      status: 0,
      message: "Network error",
    });
  },
);

export default httpClient;
