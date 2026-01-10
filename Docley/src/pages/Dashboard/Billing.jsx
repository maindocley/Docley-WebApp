import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { CreditCard, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import BillingUpgradeModal from '../../components/modals/BillingUpgradeModal';

export default function Billing() {
    const { isPremium } = useAuth();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Back to Settings */}
            <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Settings
            </button>

            {/* Current Plan Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-lg text-slate-900 dark:text-white">Current Plan</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">View your subscription status.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className={cn(
                        "relative overflow-hidden rounded-xl border p-8",
                        "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                    )}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCard className="h-32 w-32 text-slate-600" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        Free Plan
                                    </h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold border bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                                        ACTIVE
                                    </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 max-w-md">
                                    You are currently on the free tier. Upgrade to unlock all premium features.
                                </p>
                                <div className="mt-4">
                                    <Button
                                        onClick={() => setShowUpgradeModal(true)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Upgrade to Pro
                                    </Button>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                    $0
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">per month</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Features Info */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <CardTitle className="text-lg text-slate-900 dark:text-white">Plan Features</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[
                            { feature: 'Documents', value: '2 per lifetime' },
                            { feature: 'AI Diagnostics', value: '2 per lifetime' },
                            { feature: 'AI Upgrades', value: '2 per lifetime' },
                            { feature: 'Export Formats', value: 'PDF & DOCX' },
                            { feature: 'Support', value: 'Community' },
                        ].map((item) => (
                            <div key={item.feature} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="font-medium text-slate-900 dark:text-white">{item.feature}</span>
                                <span className="text-slate-600 dark:text-slate-400">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <BillingUpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
    );
}
