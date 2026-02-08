import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface Props {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<Props> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const styles = {
    success: 'bg-white border-l-4 border-green-500 text-slate-800',
    error: 'bg-white border-l-4 border-red-500 text-slate-800',
    info: 'bg-white border-l-4 border-blue-500 text-slate-800',
  };

  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <XCircle size={20} className="text-red-500" />,
    info: <AlertCircle size={20} className="text-blue-500" />,
  };

  return (
    <div className={`pointer-events-auto flex items-center p-4 rounded shadow-lg min-w-[300px] animate-in slide-in-from-right fade-in duration-300 ${styles[toast.type]}`}>
      <div className="mr-3">{icons[toast.type]}</div>
      <div className="flex-1 font-medium text-sm">{toast.message}</div>
      <button onClick={() => onDismiss(toast.id)} className="ml-4 text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
    </div>
  );
};

export default ToastContainer;