import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastProvider";
import "./index.css";
import App from "./App.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Bail out early for non-recoverable client/auth errors.
        // Interceptor-level retries (e.g., 401 refresh) are completely
        // decoupled from this React Query logic and happen before this.
        if (
          error.status === 401 ||
          error.status === 403 ||
          error.status === 404
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      const message = error?.message || "Something went wrong";
      window.dispatchEvent(
        new CustomEvent("toast:error", { detail: { message } }),
      );
    },
  }),
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
