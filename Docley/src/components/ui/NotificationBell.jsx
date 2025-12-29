import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Trash2, UserPlus, FileText, Sparkles, Download, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../../services/notificationsService';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';

const notificationIcons = {
    user_signup: UserPlus,
    document_created: FileText,
    document_upgraded: Sparkles,
    document_exported: Download,
    feedback_submitted: MessageSquare,
    user_banned: AlertCircle,
    user_unbanned: UserPlus,
    system_alert: AlertCircle,
};

const notificationColors = {
    user_signup: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
    document_created: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
    document_upgraded: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
    document_exported: 'bg-green-500/20 text-green-200 border-green-500/30',
    feedback_submitted: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    user_banned: 'bg-red-500/20 text-red-200 border-red-500/30',
    user_unbanned: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    system_alert: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
};

export function NotificationBell() {
    const { theme } = useTheme();
    const { addToast } = useToast();
    const isDark = theme === 'dark';
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const loadNotifications = async () => {
        setIsLoading(true);
        try {
            const [notifs, count] = await Promise.all([
                getNotifications(),
                getUnreadCount(),
            ]);
            
            // Check if new notifications arrived
            if (count > previousUnreadCount && previousUnreadCount >= 0) {
                const newCount = count - previousUnreadCount;
                // Show toast for new notifications
                if (newCount > 0) {
                    addToast(
                        `${newCount} new notification${newCount > 1 ? 's' : ''} received`,
                        'info'
                    );
                }
                
                // Play subtle notification sound (if browser allows)
                try {
                    // Create a simple beep sound using Web Audio API
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = 800;
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                } catch (e) {
                    // Ignore audio errors (browser may not support)
                }
            }
            
            setNotifications(notifs);
            setPreviousUnreadCount(count);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        loadNotifications();
                    }
                }}
                className={cn(
                    "relative p-2 rounded-lg transition-all duration-200",
                    isDark
                        ? "hover:bg-white/10 text-slate-200"
                        : "hover:bg-slate-100 text-slate-700"
                )}
                title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'No new notifications'}
            >
                <Bell className={cn(
                    "h-5 w-5 transition-all",
                    unreadCount > 0 && "text-orange-500"
                )} />
                {unreadCount > 0 && (
                    <span className={cn(
                        "absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold",
                        "bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 shadow-lg shadow-orange-500/50",
                        isDark ? "border-slate-900" : "border-white",
                        "animate-pulse"
                    )}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className={cn(
                    "absolute right-0 top-full mt-2 w-96 max-h-[600px] rounded-xl shadow-2xl border z-50",
                    "flex flex-col",
                    isDark
                        ? "bg-slate-900 border-white/10"
                        : "bg-white border-slate-200"
                )}>
                    {/* Header */}
                    <div className={cn(
                        "flex items-center justify-between p-4 border-b",
                        isDark ? "border-white/10" : "border-slate-200"
                    )}>
                        <div>
                            <h3 className={cn("font-bold", isDark ? "text-white" : "text-slate-900")}>
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <p className={cn("text-xs mt-1", isDark ? "text-slate-400" : "text-slate-500")}>
                                    {unreadCount} unread
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors text-xs",
                                        isDark
                                            ? "hover:bg-white/10 text-slate-300"
                                            : "hover:bg-slate-100 text-slate-600"
                                    )}
                                    title="Mark all as read"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isDark
                                        ? "hover:bg-white/10 text-slate-300"
                                        : "hover:bg-slate-100 text-slate-600"
                                )}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <Bell className={cn("h-12 w-12 mx-auto mb-4", isDark ? "text-slate-600" : "text-slate-400")} />
                                <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-600")}>
                                    No notifications yet
                                </p>
                                <p className={cn("text-xs mt-2", isDark ? "text-slate-500" : "text-slate-500")}>
                                    You'll see notifications here when events occur
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)' }}>
                                {notifications.map((notification) => {
                                    const Icon = notificationIcons[notification.type] || Bell;
                                    const colorClass = notificationColors[notification.type] || notificationColors.system_alert;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-4 transition-colors cursor-pointer group",
                                                !notification.read && isDark && "bg-orange-500/5",
                                                !notification.read && !isDark && "bg-orange-50",
                                                isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                            )}
                                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 border",
                                                    colorClass
                                                )}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1">
                                                            <p className={cn(
                                                                "text-sm font-semibold",
                                                                !notification.read && "font-bold",
                                                                isDark ? "text-white" : "text-slate-900"
                                                            )}>
                                                                {notification.title}
                                                            </p>
                                                            <p className={cn(
                                                                "text-xs mt-1 leading-relaxed",
                                                                isDark ? "text-slate-300" : "text-slate-600"
                                                            )}>
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                        {!notification.read && (
                                                            <span className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className={cn(
                                                            "text-xs",
                                                            isDark ? "text-slate-500" : "text-slate-400"
                                                        )}>
                                                            {formatTime(notification.created_at)}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(notification.id);
                                                            }}
                                                            className={cn(
                                                                "opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity",
                                                                isDark
                                                                    ? "hover:bg-white/10 text-slate-400"
                                                                    : "hover:bg-slate-200 text-slate-500"
                                                            )}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className={cn(
                            "p-3 border-t text-center",
                            isDark ? "border-white/10" : "border-slate-200"
                        )}>
                            <button
                                onClick={loadNotifications}
                                className={cn(
                                    "text-xs font-medium transition-colors",
                                    isDark
                                        ? "text-slate-400 hover:text-white"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Refresh
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

