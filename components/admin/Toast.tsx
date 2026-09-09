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
      ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
      : type === 'error'
      ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
      : 'bg-cyan-950/90 border-cyan-500/40 text-cyan-200';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200 ${bg}`}
      style={{ maxWidth: '420px' }}
    >
      {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      <span className="text-sm font-medium leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
