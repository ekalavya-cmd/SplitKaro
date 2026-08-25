import React, { useState, useCallback, useEffect, useRef } from "react";
import { ToastContext } from "./ToastContext";

// ---------------------------------------------------------------------------
// Individual Toast Item
// ---------------------------------------------------------------------------
const ICONS = {
  success: "check_circle",
  error: "error",
};

const STYLES = {
  success: {
    container:
      "border-secondary/30 bg-secondary-container text-on-secondary-container",
    icon: "text-on-secondary-container",
    dismiss: "hover:bg-secondary/20 text-on-secondary-container",
  },
  error: {
    container: "border-error/30 bg-error-container text-on-error-container",
    icon: "text-on-error-container",
    dismiss: "hover:bg-error/20 text-on-error-container",
  },
};

const ToastItem = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const style = STYLES[toast.type] ?? STYLES.error;
  const icon = ICONS[toast.type] ?? "info";

  // Slide-in: trigger animation on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    // Allow slide-out animation before removing from DOM
    setTimeout(() => onDismiss(toast.id), 200);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`pointer-events-auto flex w-80 items-center gap-3 rounded-lg border px-4 py-2 shadow-[0px_10px_15px_rgba(0,0,0,0.1)] transition-all duration-200 ${style.container} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      {/* Status icon */}
      <span
        className={`material-symbols-outlined shrink-0 text-[20px] ${style.icon}`}
      >
        {icon}
      </span>

      {/* Message */}
      <p className="flex-1 font-label-sm text-label-sm leading-snug">
        {toast.message}
      </p>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className={`-mr-1 rounded-DEFAULT p-1 transition-colors ${style.dismiss}`}
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ToastProvider — manages toast list, exposes showToast/dismissToast via context
// ---------------------------------------------------------------------------
const AUTO_DISMISS_MS = 4000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  // Track timers so we can clear them on unmount
  const timersRef = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    ({ type, message }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      setToasts((prev) => {
        // Deduplicate: if a toast with this exact message and type is already visible, ignore
        if (prev.some((t) => t.message === message && t.type === type)) {
          return prev;
        }

        // Only set the timer if we actually add the toast
        timersRef.current[id] = setTimeout(() => {
          dismissToast(id);
        }, AUTO_DISMISS_MS);
        
        return [...prev, { id, type, message }];
      });

      return id;
    },
    [dismissToast],
  );

  // Clean up any outstanding timers on unmount
  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      Object.values(activeTimers).forEach(clearTimeout);
    };
  }, []);

  // Listen for global toast events (e.g. from QueryCache outside of React)
  useEffect(() => {
    const handleGlobalError = (event) => {
      showToast({ type: "error", message: event.detail.message });
    };
    window.addEventListener("toast:error", handleGlobalError);
    return () => window.removeEventListener("toast:error", handleGlobalError);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Fixed toast container — bottom-right, newest on top (flex-col-reverse). Always mounted for ErrorBlock portals. */}
      <div
        id="toast-stack-container"
        aria-label="Notifications"
        className="pointer-events-none fixed right-6 bottom-6 z-50 flex flex-col-reverse gap-3"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
