import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ id, type, message, onDismiss }) => {
    const icons = {
        success: CheckCircle2,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle
    };

    const colors = {
        success: "border-green-500/20 bg-green-500/10 text-green-500",
        error: "border-red-500/20 bg-red-500/10 text-red-500",
        info: "border-blue-500/20 bg-blue-500/10 text-blue-500",
        warning: "border-orange-500/20 bg-orange-500/10 text-orange-500"
    };

    const Icon = icons[type] || icons.info;

    return (
        <div className={cn(
            "group flex items-center gap-3 w-full max-w-sm px-4 py-3 mb-3 rounded-xl border backdrop-blur-xl shadow-2xl relative overflow-hidden",
            "animate-in slide-in-from-right-full fade-in duration-500 ease-out",
            colors[type] || colors.info
        )}>
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />

            <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border flex-shrink-0 transition-transform group-hover:scale-110",
                colors[type] || colors.info
            )}>
                <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight capitalize mb-0.5">{type}</p>
                <p className="text-xs font-medium opacity-90 truncate">{message}</p>
            </div>

            <button
                onClick={() => onDismiss(id)}
                className="p-1 rounded-md hover:bg-white/10 transition-colors text-current opacity-40 hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-current opacity-20 w-full">
                <div className="h-full bg-current animate-shrink" style={{ animation: 'shrink 4s linear forwards' }} />
            </div>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, toast: addToast }}>
            {children}
            {createPortal(
                <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <ToastItem {...t} onDismiss={removeToast} />
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
