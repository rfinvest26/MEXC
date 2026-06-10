import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'info' | 'error' | 'success';

interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  durationMs?: number;
  dedupeKey?: string;
}

interface ToastContextValue {
  show: (message: string | ToastOptions, type?: ToastType) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  durationMs: number;
  dedupeKey: string;
}

const DEFAULT_DURATION_MS = 3200;
const MAX_VISIBLE_TOASTS = 3;

function buildToastId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function defaultTitleForType(type: ToastType): string {
  if (type === 'success') return 'Success';
  if (type === 'error') return 'Error';
  return 'Notice';
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId != null) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    clearTimer(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, [clearTimer]);

  const scheduleDismiss = useCallback((id: string, durationMs: number) => {
    clearTimer(id);
    const timerId = window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      timersRef.current.delete(id);
    }, durationMs);
    timersRef.current.set(id, timerId);
  }, [clearTimer]);

  const show = useCallback((input: string | ToastOptions, fallbackType: ToastType = 'info') => {
    const nextType = typeof input === 'string' ? fallbackType : (input.type ?? fallbackType);
    const nextMessage = typeof input === 'string' ? input : input.message;
    const nextTitle = typeof input === 'string' ? defaultTitleForType(nextType) : (input.title?.trim() || defaultTitleForType(nextType));
    const durationMs = typeof input === 'string' ? DEFAULT_DURATION_MS : Math.max(1200, input.durationMs ?? DEFAULT_DURATION_MS);
    const dedupeKey = typeof input === 'string'
      ? `${nextType}:${nextMessage.trim()}`
      : (input.dedupeKey?.trim() || `${nextType}:${nextTitle}:${nextMessage.trim()}`);

    let resolvedId = typeof input === 'string' ? buildToastId() : (input.id?.trim() || buildToastId());

    setToasts((prev) => {
      const existing = prev.find((toast) => toast.dedupeKey === dedupeKey);
      const nextToast: ToastItem = {
        id: existing?.id || resolvedId,
        title: nextTitle,
        message: nextMessage,
        type: nextType,
        durationMs,
        dedupeKey,
      };

      resolvedId = nextToast.id;
      const withoutExisting = existing ? prev.filter((toast) => toast.id !== existing.id) : prev;
      const next = [...withoutExisting, nextToast];
      return next.slice(-MAX_VISIBLE_TOASTS);
    });

    scheduleDismiss(resolvedId, durationMs);
    return resolvedId;
  }, [scheduleDismiss]);

  useEffect(() => () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+16px)] left-4 right-4 z-[100] flex justify-center pointer-events-none">
          <div className="w-full max-w-md space-y-2.5">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="pointer-events-auto animate-slide-in-right rounded-2xl border px-4 py-3 shadow-elevation-2"
                style={{
                  background: 'rgba(11, 17, 28, 0.96)',
                  backdropFilter: 'blur(18px)',
                  borderColor:
                    toast.type === 'success'
                      ? 'rgba(34, 197, 94, 0.24)'
                      : toast.type === 'error'
                        ? 'rgba(248, 113, 113, 0.24)'
                        : 'rgba(59, 130, 246, 0.22)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {toast.type === 'success' && <CheckCircle2 size={18} className="text-up" />}
                    {toast.type === 'error' && <AlertCircle size={18} className="text-down" />}
                    {toast.type === 'info' && <Info size={18} className="text-neon" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      {toast.title}
                    </div>
                    <div className="mt-1 text-sm leading-5 text-white break-words">
                      {toast.message}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => dismiss(toast.id)}
                    className="shrink-0 rounded-full p-1 text-white/50 transition-colors hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { show: () => '', dismiss: () => {} };
  return ctx;
}
