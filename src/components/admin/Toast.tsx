'use client';

import { useEffect, useState } from 'react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

let addToastFn: ((type: 'success' | 'error', message: string) => void) | null = null;

export function showToast(type: 'success' | 'error', message: string) {
  addToastFn?.(type, message);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (type, message) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}
            animate-[slideIn_0.2s_ease-out]
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
