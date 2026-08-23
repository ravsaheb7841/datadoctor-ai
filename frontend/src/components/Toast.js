import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
const Toast = ({ type = 'success', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  const styles = {
    success: { bg: 'bg-green-50 dark:bg-green-900', border: 'border-green-200 dark:border-green-700', text: 'text-green-800 dark:text-green-200', icon: CheckCircle2, iconColor: 'text-green-500' },
    error: { bg: 'bg-red-50 dark:bg-red-900', border: 'border-red-200 dark:border-red-700', text: 'text-red-800 dark:text-red-200', icon: XCircle, iconColor: 'text-red-500' },
    warning: { bg: 'bg-yellow-50 dark:bg-yellow-900', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-800 dark:text-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-500' },
    info: { bg: 'bg-blue-50 dark:bg-blue-900', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-800 dark:text-blue-200', icon: Info, iconColor: 'text-blue-500' },
  };
  const config = styles[type] || styles.info;
  const IconComponent = config.icon;
  return (
    <div className={`animate-toast-in fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg border shadow-lg ${config.bg} ${config.border} ${config.text}`}>
      <IconComponent className={`w-5 h-5 mr-2 ${config.iconColor}`} />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-3 p-1 hover:opacity-70" aria-label="Close notification">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
export default Toast;
