import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authService from "../services/auth.service";
import { AuthContext } from "./AuthContextObj";
import { useAuth } from "./useAuth";

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  const silentRestore = async () => {
    try {
      const data = await authService.refresh();
      setIsAuthenticated(true);
      setUser(data.user || null); // Known gap: refresh only returns accessToken currently
    } catch (error) {
      if (error && error.status === 0) {
        setHasConnectionError(true);
        // Do not touch isAuthenticated — leave it in its current state
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    silentRestore();
  }, []);

  const retryConnection = () => {
    setIsInitializing(true);
    setHasConnectionError(false);
    silentRestore();
  };

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
    try {
      const data = await authService.logout();
      return data;
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setIsAuthenticated(false);
      queryClient.clear();
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      const data = await authService.logoutAll();
      return data;
    } catch (error) {
      console.error("Logout all devices failed:", error);
      throw error;
    } finally {
      setIsAuthenticated(false);
      queryClient.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isInitializing,
        hasConnectionError,
        retryConnection,
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
