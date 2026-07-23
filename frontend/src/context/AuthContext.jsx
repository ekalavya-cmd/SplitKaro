import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const silentRestore = async () => {
      try {
        const data = await authService.refresh();
        setIsAuthenticated(true);
        setUser(data.user || null); // Known gap: refresh only returns accessToken currently
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    silentRestore();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setIsAuthenticated(true);
    setUser(data.user || null);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setIsAuthenticated(true);
    setUser(data.user || null);
    return data;
  };

  const logout = async () => {
    const data = await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    return data;
  };
  
  const logoutAll = async () => {
    const data = await authService.logoutAll();
    setIsAuthenticated(false);
    setUser(null);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isInitializing,
        login,
        register,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// TEMPORARY DEV-ONLY BRIDGE — remove once real login/register UI exists
export const DevAuthBridge = () => {
  const auth = useAuth();
  
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.authContext = auth;
    }
    return () => {
      if (import.meta.env.DEV) {
        delete window.authContext;
      }
    };
  }, [auth]);

  return null;
};
