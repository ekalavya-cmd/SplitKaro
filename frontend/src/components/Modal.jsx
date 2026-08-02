import React, { useEffect } from "react";

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-[0px_10px_15px_rgba(0,0,0,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant p-6 pb-4">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
            {title}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-outline-variant p-6 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
