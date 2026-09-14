'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  detail?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start justify-between p-4 rounded-lg bg-obsidian-900 border border-obsidian-600 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="flex items-start space-x-3">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-pearl-100">{toast.message}</p>
              {toast.detail && (
                <p className="text-xs text-pearl-500 font-mono mt-0.5">{toast.detail}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-pearl-500 hover:text-pearl-100 transition-colors ml-4 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
