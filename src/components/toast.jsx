import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const triggerToast = (message, type = 'success') => {
  const event = new CustomEvent('show-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

export const toast = Object.assign(triggerToast, {
  success: (message) => triggerToast(message, 'success'),
  error: (message) => triggerToast(message, 'error'),
  info: (message) => triggerToast(message, 'info'),
  warning: (message) => triggerToast(message, 'warning')
});

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const typeStyles = {
    success: {
      border: 'border-l-4 border-[#009EDB]',
      icon: <CheckCircle className="text-[#009EDB] w-5 h-5 flex-shrink-0" />,
      bg: 'bg-white'
    },
    error: {
      border: 'border-l-4 border-red-500',
      icon: <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />,
      bg: 'bg-white'
    },
    warning: {
      border: 'border-l-4 border-amber-500',
      icon: <AlertCircle className="text-amber-500 w-5 h-5 flex-shrink-0" />,
      bg: 'bg-white'
    },
    info: {
      border: 'border-l-4 border-[#003147]',
      icon: <Info className="text-[#003147] w-5 h-5 flex-shrink-0" />,
      bg: 'bg-white'
    }
  };

  const style = typeStyles[toast.type] || typeStyles.success;

  return (
    <div 
      className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border border-gray-100 ${style.border} ${style.bg} transition-all duration-300 max-w-sm w-full animate-slideIn select-none font-sans pointer-events-auto`}
      role="alert"
    >
      {style.icon}
      <div className="flex-1 text-xs sm:text-sm font-semibold text-gray-800 text-left">
        {toast.message}
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-50 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (e) => {
      const { message, type } = e.detail;
      const newToast = {
        id: Date.now() + Math.random(),
        message,
        type
      };
      setToasts(prev => [...prev, newToast]);
    };

    window.addEventListener('show-toast', handleShowToast);
    return () => window.removeEventListener('show-toast', handleShowToast);
  }, []);

  const handleClose = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 w-full max-w-[320px] sm:max-w-sm pointer-events-none px-4 sm:px-0">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={handleClose} />
      ))}
    </div>
  );
};
