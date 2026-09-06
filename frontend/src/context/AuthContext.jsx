import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authService from "../services/auth.service";
import { AuthContext } from "./AuthContextObj";

const RETRY_INTERVALS = [2000, 4000, 8000, 16000, 30000];

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  // Ref-based mirror of isAuthenticated for use inside stable event listeners
  // (useEffect([]) captures the initial value, so reading state directly would
  // always see `false` — the ref stays in sync via the effect below).
  const isAuthenticatedRef = useRef(false);

  const silentRestore = async () => {
    try {
      const data = await authService.refresh();
      setIsAuthenticated(true);
      setUser(data.user || null); // Known gap: refresh only returns accessToken currently
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    silentRestore();
  }, []);

  // Keep isAuthenticatedRef in sync so stable event listeners can read current auth state.
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Keep isAuthenticatedRef in sync so stable event listeners can read current auth state.

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

  const logout = useCallback(async () => {
    try {
      const data = await authService.logout();
      return data;
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      // Cancel in-flight queries first so they cannot fire a second 401 wave
      // after the cache is cleared (the wave that caused the double-logout bug).
      await queryClient.cancelQueries();
      setIsAuthenticated(false);
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient]);

  const logoutAll = async () => {
    try {
      const data = await authService.logoutAll();
      return data;
    } catch (error) {
      console.error("Logout all devices failed:", error);
      throw error;
    } finally {
      await queryClient.cancelQueries();
      setIsAuthenticated(false);
      queryClient.clear();
      setUser(null);
    }
  };

  useEffect(() => {
    const handleForceLogout = () => {
      // Guard: if already logged out (e.g. from a previous auth:forceLogout dispatch
      // in the same failure wave), skip — prevents a second refresh-and-logout cycle
      // caused by queryClient.clear() making stale queries refetch against a dead token.
      if (!isAuthenticatedRef.current) return;
      logout().catch(() => {});
    };
    window.addEventListener("auth:forceLogout", handleForceLogout);
    return () =>
      window.removeEventListener("auth:forceLogout", handleForceLogout);
  }, [logout]);

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
