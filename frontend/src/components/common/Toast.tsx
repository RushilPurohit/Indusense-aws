import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  undoAction?: () => void;
  undoLabel?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    success: {
      bg: 'bg-emerald-900/95 border-emerald-700 text-white',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    error: {
      bg: 'bg-rose-900/95 border-rose-700 text-white',
      icon: AlertCircle,
      iconColor: 'text-rose-400',
    },
    warning: {
      bg: 'bg-amber-900/95 border-amber-700 text-white',
      icon: AlertCircle,
      iconColor: 'text-amber-400',
    },
    info: {
      bg: 'bg-slate-900/95 border-slate-700 text-white',
      icon: Info,
      iconColor: 'text-sky-400',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200 ${config.bg}`}
      role="alert"
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 min-w-0 space-y-0.5">
        {toast.title && <div className="font-bold text-xs">{toast.title}</div>}
        <div className="text-slate-200 leading-snug">{toast.message}</div>
        {toast.undoAction && (
          <button
            type="button"
            onClick={() => {
              toast.undoAction!();
              onDismiss();
            }}
            className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 hover:text-sky-200 underline"
          >
            <RotateCcw className="w-3 h-3" />
            {toast.undoLabel || 'Undo action'}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-1 rounded-md shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Toast;

