import { X, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomSheet = ({ isOpen, notification, onClose, onAction }) => {
    if (!isOpen || !notification) return null;

    const handleAction = () => {
        const { action } = notification;
        if (!action || !onAction) return;

        onAction(action);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className={cn(
                "fixed inset-x-0 bottom-0 z-[10001] bg-white dark:bg-slate-900 rounded-t-[32px] p-8 shadow-2xl transition-transform duration-500 ease-out transform translate-y-0",
                "border-t border-slate-200 dark:border-white/10"
            )}>
                {/* Drag Handle */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full" />

                <div className="max-w-xl mx-auto text-center">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-6 animate-bounce-subtle">
                        <Sparkles className="h-8 w-8" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">
                        Wait, you've reached a limit!
                    </h2>

                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                        {notification.message} To continue using our premium AI features and create unlimited documents, consider upgrading to Docley Pro.
                    </p>

                    <div className="flex flex-col gap-3">
                        {notification.action && (
                            <button
                                onClick={handleAction}
                                className="group w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-base font-bold shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transform transition-all active:scale-[0.98] hover:scale-[1.01]"
                            >
                                {notification.action.label}
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
