import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { BottomSheet } from '../components/ui/BottomSheet';
import { registerNotificationHandler } from '../api/client';
import { useEffect } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

const ToastItem = ({ id, priority, message, onDismiss, ttl }) => {
    const icons = {
        critical: AlertCircle,
        normal: AlertTriangle,
        minimal: CheckCircle2,
    };

    const colors = {
        critical: "border-red-500/20 bg-red-500/10 text-red-500",
        normal: "border-orange-500/20 bg-orange-500/10 text-orange-500",
        minimal: "border-green-500/20 bg-green-500/10 text-green-500",
    };

    const Icon = icons[priority] || icons.minimal;

    return (
        <div className={cn(
            "group flex items-center gap-3 w-full max-w-sm px-4 py-3 mb-3 rounded-xl border backdrop-blur-xl shadow-2xl relative overflow-hidden",
            "animate-in slide-in-from-right-full fade-in duration-500 ease-out",
            colors[priority]
        )}>
            <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border flex-shrink-0 transition-transform group-hover:scale-110",
                colors[priority]
            )}>
                <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold opacity-90 truncate">{message}</p>
            </div>

            <button
                onClick={() => onDismiss(id)}
                className="p-1 rounded-md hover:bg-white/10 transition-colors text-current opacity-40 hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>

            {ttl && (
                <div className="absolute bottom-0 left-0 h-[2px] bg-current opacity-20 w-full">
                    <div
                        className="h-full bg-current animate-shrink"
                        style={{ animation: `shrink ${ttl}ms linear forwards` }}
                    />
                </div>
            )}
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [activeCritical, setActiveCritical] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);

    const showNotification = useCallback((notification) => {
        if (!notification) return;

        const { priority, message, action, ttl, code } = notification;

        if (priority === 'critical') {
            setActiveCritical({ id: Date.now(), ...notification });
            return;
        }

        const id = Date.now();
        setToasts(prev => [...prev, { id, priority, message, ttl }]);

        if (ttl) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, ttl);
        }
    }, []);

    useEffect(() => {
        registerNotificationHandler(showNotification);
    }, [showNotification]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const dismissCritical = useCallback(() => {
        setActiveCritical(null);
    }, []);

    const triggerAction = useCallback((action) => {
        if (!action) return;
        setPendingAction(action);
    }, []);

    const resolveAction = useCallback(() => {
        setPendingAction(null);
    }, []);

    return (
        <NotificationContext.Provider value={{
            showNotification,
            toast: showNotification,
            pendingAction,
            triggerAction,
            resolveAction
        }}>
            {children}

            {/* Toasts (Normal & Minimal) */}
            {createPortal(
                <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <ToastItem {...t} onDismiss={removeToast} />
                        </div>
                    ))}
                </div>,
                document.body
            )}

            {/* Bottom Sheet (Critical) */}
            <BottomSheet
                isOpen={!!activeCritical}
                notification={activeCritical}
                onClose={dismissCritical}
                onAction={triggerAction}
            />
        </NotificationContext.Provider>
    );
};
