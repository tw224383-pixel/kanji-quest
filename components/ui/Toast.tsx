"use client";

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "error" | "success" | "info";
type ToastItem = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType) => void } | undefined>(undefined);

const TOAST_STYLES: Record<ToastType, string> = {
  error: "bg-red-600 border-red-300 text-white",
  success: "bg-emerald-600 border-emerald-300 text-white",
  info: "bg-slate-800 border-slate-500 text-white",
};

const TOAST_ICONS: Record<ToastType, string> = {
  error: "⚠️",
  success: "✅",
  info: "ℹ️",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "error") => {
    const id = nextId.current++;
    setToasts(list => [...list, { id, message, type }]);
    setTimeout(() => {
      setToasts(list => list.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 left-0 right-0 z-[200] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className={`pointer-events-auto max-w-sm w-full sm:w-auto px-5 py-3 rounded-2xl shadow-2xl border-2 font-bold text-sm text-center ${TOAST_STYLES[t.type]}`}
            >
              {TOAST_ICONS[t.type]} {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
