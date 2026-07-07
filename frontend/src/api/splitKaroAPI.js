import axios from "axios";

const splitKaroAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

splitKaroAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      return Promise.reject({
        status,
        message: data?.error || "Something went wrong",
      });
    }

    return Promise.reject({
      status: 0,
      message: "Network error",
    });
  },
);

export default splitKaroAPI;
