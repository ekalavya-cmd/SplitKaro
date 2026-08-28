import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as authService from "../services/auth.service";
import { AuthContext } from "./AuthContextObj";
import { useAuth } from "./useAuth";

const RETRY_INTERVALS = [2000, 4000, 8000, 16000, 30000];

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Refs for auto-retry backoff — held outside state to avoid re-renders
  const retryTimerRef = useRef(null);
  const retryAttemptRef = useRef(0);
  // Ref-based mirror of isAuthenticated for use inside stable event listeners
  // (useEffect([]) captures the initial value, so reading state directly would
  // always see `false` — the ref stays in sync via the effect below).
  const isAuthenticatedRef = useRef(false);

  const silentRestore = async () => {
    try {
      const data = await authService.refresh();
      setIsAuthenticated(true);
      setUser(data.user || null); // Known gap: refresh only returns accessToken currently
      setHasConnectionError(false);
    } catch (error) {
      if (error && error.status === 0) {
        setHasConnectionError(true);
        // Do not touch isAuthenticated — leave it in its current state
      } else {
        setHasConnectionError(false);
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

  // Keep isAuthenticatedRef in sync so stable event listeners can read current auth state.
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Auto-retry loop: fires only while hasConnectionError is true.
  // Self-reschedules recursively at increasing intervals (2s→4s→8s→16s→30s, then holds at 30s).
  // Background retries call silentRestore() directly — no isInitializing reset, since
  // hasConnectionError already keeps skeletons visible throughout. This is deliberate:
  // flipping isInitializing on every background attempt would cause unnecessary flicker.
  useEffect(() => {
    if (!hasConnectionError) {
      // Connection is fine (or not yet in error) — clear any pending timer and reset attempt counter
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      retryAttemptRef.current = 0;
      return;
    }

    const scheduleNextRetry = () => {
      const intervalIndex = Math.min(
        retryAttemptRef.current,
        RETRY_INTERVALS.length - 1,
      );
      const delay = RETRY_INTERVALS[intervalIndex];

      retryTimerRef.current = setTimeout(async () => {
        retryAttemptRef.current += 1;
        await silentRestore();
        // If still in error state, self-reschedule — but only if we haven't been
        // cleared by a manual retry or unmount (check that retryTimerRef isn't null).
        if (retryTimerRef.current !== null) {
          scheduleNextRetry();
        }
      }, delay);
    };

    scheduleNextRetry();

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };
  }, [hasConnectionError]);

  const retryConnection = () => {
    // Clear any pending auto-retry and reset attempt counter so that if this
    // manual attempt also fails, the auto-retry sequence restarts cleanly from 2s.
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryAttemptRef.current = 0;
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
