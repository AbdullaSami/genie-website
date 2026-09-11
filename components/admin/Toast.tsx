'use client';

import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bg =
    type === 'success'
      ? 'bg-emerald-50 border-emerald-500/40 text-emerald-700'
      : type === 'error'
      ? 'bg-rose-50 border-rose-500/40 text-rose-700'
      : 'bg-cyan-50 border-cyan-500/40 text-cyan-700';

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200 ${bg}`}
      style={{ maxWidth: '420px' }}
    >
      {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />}
      <span className="text-sm font-medium leading-snug">{message}</span>
      <button
        aria-label="Dismiss notification"
        onClick={onClose}
        className="ml-auto p-1 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
