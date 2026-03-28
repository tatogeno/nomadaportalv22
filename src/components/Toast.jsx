import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const colors = {
    success: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-100',
      icon: 'text-emerald-300'
    },
    error: {
      bg: 'bg-rose-600',
      text: 'text-rose-100',
      icon: 'text-rose-300'
    },
    info: {
      bg: 'bg-blue-600',
      text: 'text-blue-100',
      icon: 'text-blue-300'
    }
  };

  const Icon = icons[type] || icons.success;
  const colorScheme = colors[type] || colors.success;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`${colorScheme.bg} ${colorScheme.text} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
      <Icon className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="hover:bg-white/10 p-1 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
