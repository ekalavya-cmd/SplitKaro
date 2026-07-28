import { useAuth } from "../context/useAuth";

export const ConnectionToast = () => {
  const { hasConnectionError, retryConnection } = useAuth();

  if (!hasConnectionError) return null;

  return (
    <div className="fixed top-16 right-0 left-0 z-20 flex items-center justify-between border-b border-error/20 bg-error-container px-6 py-2.5 text-on-error-container shadow-sm">
      <p className="font-body-md text-body-md">
        Can&apos;t reach the server &mdash; retrying&hellip;
      </p>
      <button
        onClick={retryConnection}
        className="ml-4 shrink-0 font-label-sm text-label-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-75"
      >
        Retry now
      </button>
    </div>
  );
};
