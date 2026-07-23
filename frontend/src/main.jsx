import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, DevAuthBridge } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";

// TEMPORARY DEV-ONLY BRIDGE — remove once real login/register UI exists (tracked in FEATURES.md's Frontend auth UI item).
if (import.meta.env.DEV) {
  import("./services/auth.service").then((authService) => {
    window.authService = authService;
  });
  import("./api/token.store").then((tokenStore) => {
    window.tokenStore = tokenStore;
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DevAuthBridge />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
