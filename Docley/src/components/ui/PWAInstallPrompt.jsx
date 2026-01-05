import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

export function PWAInstallPrompt({ delaySeconds = 120 }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            // Don't show again for 7 days
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                return;
            }
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Store the event for later use
            setDeferredPrompt(e);

            // Show prompt after delay
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, delaySeconds * 1000);

            return () => clearTimeout(timer);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [delaySeconds]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember dismissal for 7 days
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Don't render if already installed or no prompt available
    if (isInstalled || !showPrompt) {
        return null;
    }

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 z-50 max-w-xs w-full",
                "animate-in slide-in-from-bottom-4 fade-in duration-500"
            )}
        >
            <div
                className={cn(
                    "rounded-2xl shadow-2xl border p-5 backdrop-blur-xl",
                    isDark
                        ? "bg-slate-900/95 border-slate-700/50 text-white"
                        : "bg-white/95 border-slate-200 text-slate-900"
                )}
            >
                {/* Close button */}
                <button
                    onClick={handleDismiss}
                    className={cn(
                        "absolute top-3 right-3 p-1 rounded-lg transition-colors",
                        isDark
                            ? "text-slate-400 hover:text-white hover:bg-slate-800"
                            : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                    )}
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    {/* App icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                        <h3 className={cn(
                            "font-semibold text-base",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Install Docley App
                        </h3>
                    </div>
                </div>

                {/* Description */}
                <p className={cn(
                    "text-sm mb-5",
                    isDark ? "text-slate-300" : "text-slate-600"
                )}>
                    Install Docley on your device for a better mobile experience and quick access.
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleInstall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 transition-all active:scale-95"
                    >
                        <Download className="h-4 w-4" />
                        Install
                    </button>
                    <button
                        onClick={handleDismiss}
                        className={cn(
                            "flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all active:scale-95",
                            isDark
                                ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                        )}
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    );
}
