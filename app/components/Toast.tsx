"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastOptions = {
  tone?: "default" | "success";
  position?: "bottom" | "top-right";
};

type Toast = { id: number; message: ReactNode; duration: number } & Required<ToastOptions>;

type ToastContextValue = {
  showToast: (message: ReactNode, duration?: number, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** In-memory toast that survives client-side navigation (lives in the root layout). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: ReactNode, duration = 6000, options: ToastOptions = {}) => {
      setToast({
        id: Date.now(),
        message,
        duration,
        tone: options.tone ?? "default",
        position: options.position ?? "bottom",
      });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    timer.current = setTimeout(() => setToast(null), toast.duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed z-[60] flex px-4 ${
          toast?.position === "top-right"
            ? "inset-x-0 top-4 justify-end md:right-4 md:left-auto"
            : "inset-x-0 bottom-6 justify-center"
        }`}
      >
        {toast && (
          <div
            key={toast.id}
            role="status"
            className={`${
              toast.position === "top-right" ? "toast-in-top" : "toast-in"
            } pointer-events-auto flex max-w-md items-start gap-3 rounded-xl bg-acac-navy px-5 py-4 text-sm text-white shadow-[0_16px_40px_-12px_rgba(8,37,82,0.5)]`}
          >
            {toast.tone === "success" ? (
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300"
                aria-hidden="true"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.25l2.25 2.25L9.5 3.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            ) : (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-acac-blue-light" aria-hidden="true" />
            )}
            <div className="flex-1 leading-relaxed">{toast.message}</div>
            <button
              id="toast-dismiss"
              type="button"
              onClick={dismiss}
              aria-label="Dismiss notification"
              className="-mr-1 rounded p-1 text-white/60 transition-colors hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
