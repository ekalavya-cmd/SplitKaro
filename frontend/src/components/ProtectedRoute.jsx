import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-6 font-body-md text-on-background antialiased select-none">
        <main className="-mt-8 flex animate-pulse-subtle flex-col items-center justify-center text-center">
          {/* SplitKaro Wordmark */}
          <div className="mb-8 flex items-center justify-center">
            <span className="text-3xl font-black tracking-tight text-primary sm:text-4xl">
              SplitKaro
            </span>
          </div>

          {/* Custom Indigo Spinner */}
          <div
            className="relative mb-5 flex h-10 w-10 items-center justify-center"
            role="status"
            aria-label="Loading session"
          >
            {/* Outer Track Ring */}
            <svg
              className="h-9 w-9 animate-none text-primary/15"
              viewBox="0 0 36 36"
              fill="none"
            >
              <circle
                cx="18"
                cy="18"
                r="14"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
            </svg>
            {/* Active Indigo Spinning Arc */}
            <svg
              className="absolute inset-0 h-9 w-9 animate-spin-smooth text-primary"
              viewBox="0 0 36 36"
              fill="none"
            >
              <path
                d="M18 4C10.268 4 4 10.268 4 18"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              ></path>
            </svg>
          </div>

          {/* Status Text */}
          <p className="text-[15px] font-normal tracking-normal text-on-surface-variant">
            Getting things ready...
          </p>
        </main>

        {/* Accessibility Announcement */}
        <div className="sr-only" aria-live="polite">
          Verifying your SplitKaro session and preparing your workspace.
        </div>

        {/* Minimal Brand Footnote */}
        <footer className="absolute bottom-8 text-xs font-medium tracking-wide text-on-surface-variant/50">
          SplitKaro &copy; {new Date().getFullYear()}
        </footer>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
