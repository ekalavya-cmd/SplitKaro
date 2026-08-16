import { useAuth } from "../context/useAuth";

export const ConnectionToast = () => {
  const { hasConnectionError, retryConnection } = useAuth();

  if (!hasConnectionError) return null;

  return (
    <div className="fixed top-16 right-0 left-0 z-20 flex items-center justify-between border-b border-error/30 bg-error-container px-6 py-2.5 text-on-error-container shadow-[0px_10px_15px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined shrink-0 text-[20px] text-on-error-container">
          error
        </span>
        <p className="font-label-sm text-label-sm leading-snug">
          Can&apos;t reach the server &mdash; retrying&hellip;
        </p>
      </div>
      <button
        onClick={retryConnection}
        className="ml-4 shrink-0 rounded-DEFAULT px-2 py-1 font-label-sm text-label-sm font-semibold underline underline-offset-2 transition-colors hover:bg-error/20"
      >
        Retry now
      </button>
    </div>
  );
};
