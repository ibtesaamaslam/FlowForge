import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle, Info } from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'primary' | 'success';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
}

const ConfirmationModal: React.FC<Props> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const styles = {
    danger: {
      bgIcon: 'bg-red-100',
      textIcon: 'text-red-600',
      btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      icon: AlertTriangle
    },
    primary: {
      bgIcon: 'bg-blue-100',
      textIcon: 'text-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      icon: HelpCircle
    },
    success: {
      bgIcon: 'bg-green-100',
      textIcon: 'text-green-600',
      btn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      icon: CheckCircle
    }
  };

  const style = styles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
        <div className="p-6">
          <div className="flex items-start mb-4">
            <div className={`p-3 rounded-full shrink-0 mr-4 ${style.bgIcon} ${style.textIcon}`}>
              <Icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
            </div>
          </div>
          
          <div className="flex space-x-3 justify-end mt-6">
            <button 
              onClick={onCancel}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-slate-200 outline-none"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-95 focus:ring-2 focus:ring-offset-2 outline-none ${style.btn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;