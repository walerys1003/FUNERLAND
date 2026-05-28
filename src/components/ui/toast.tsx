'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; type: ToastType; title: string; description?: string };

type ToastContextValue = {
  toast: (t: { type?: ToastType; title: string; description?: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Provide a no-op fallback so components can call useToast without a provider
    return {
      toast: (t) => console.log('[toast]', t.title, t.description || ''),
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'info', title, description }: { type?: ToastType; title: string; description?: string }) => {
      const id = Date.now() + Math.random();
      setToasts((arr) => [...arr, { id, type, title, description }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-[360px] w-[calc(100%-2rem)] pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
  const tone =
    toast.type === 'success'
      ? 'border-accent-green/30 bg-white'
      : toast.type === 'error'
      ? 'border-error/30 bg-white'
      : 'border-border-soft bg-white';
  const iconTone =
    toast.type === 'success' ? 'text-accent-green' : toast.type === 'error' ? 'text-error' : 'text-navy';

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'card border-2 p-3.5 pr-9 shadow-card pointer-events-auto relative transition-all duration-200',
        tone,
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('w-5 h-5 shrink-0', iconTone)} />
        <div className="min-w-0">
          <div className="font-semibold text-[13.5px] leading-tight">{toast.title}</div>
          {toast.description && (
            <div className="mt-0.5 text-[12.5px] text-text-secondary leading-relaxed">
              {toast.description}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-text-muted hover:text-navy rounded focus:outline-none focus:ring-2 focus:ring-accent-green/40"
        aria-label="Zamknij powiadomienie"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
