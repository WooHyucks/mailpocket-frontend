import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "info" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, options?: { type?: ToastType; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, options?: { type?: ToastType; duration?: number }) => {
      const id = Date.now() + Math.random();
      const type: ToastType = options?.type ?? "info";
      const duration = options?.duration ?? 2000;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const getBgClass = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-emerald-500";
      case "error":
        return "bg-rose-500";
      default:
        return "bg-gray-900";
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast keyframes (scoped once) */}
      <style>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translateY(-8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] space-y-2 pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[220px] max-w-[360px] px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white ${getBgClass(
              toast.type
            )} bg-opacity-95 border border-white/10 animate-[toast-in_0.25s_ease-out]`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx.showToast;
};

