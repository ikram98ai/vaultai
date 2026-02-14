import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

export function NotificationToast() {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col gap-3 max-w-md w-full sm:w-auto">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in slide-in-from-right-10 duration-300 ${
            notification.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-200' :
            notification.type === 'error' ? 'bg-red-900/20 border-red-500/50 text-red-200' :
            notification.type === 'warning' ? 'bg-amber-900/20 border-amber-500/50 text-amber-200' :
            'bg-bg-secondary border-border text-text-primary'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {notification.type === 'success' && <CheckCircle size={18} className="text-green-400" />}
            {notification.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
            {notification.type === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
            {notification.type === 'info' && <Info size={18} className="text-blue-400" />}
          </div>
          
          <div className="flex-1 text-sm font-medium leading-tight">
            {notification.message}
          </div>
          
          <button
            onClick={() => removeNotification(notification.id)}
            className="mt-0.5 text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
