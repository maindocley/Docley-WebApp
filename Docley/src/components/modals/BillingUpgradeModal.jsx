import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Check, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { paymentsService } from '../../services/paymentsService';
import { useToast } from '../../context/ToastContext';

export default function BillingUpgradeModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const { url } = await paymentsService.createCheckoutSession();
            if (url) {
                window.location.href = url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            addToast('Failed to start checkout process. Please try again.', 'error');
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-slate-900 dark:text-white flex items-center gap-2"
                                    >
                                        <Sparkles className="h-5 w-5 text-indigo-500" />
                                        Upgrade to Pro
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-slate-400 hover:text-slate-500 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-2">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 mb-6">
                                        <h4 className="text-2xl font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                                            $1<span className="text-sm font-normal text-indigo-700 dark:text-indigo-300">/mo</span>
                                        </h4>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-300">
                                            Unlock the full power of Docley
                                        </p>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {[
                                            'Unlimited AI Document Analysis',
                                            'Advanced PDF & DOCX Exports',
                                            'Priority Support',
                                            'Early Access to New Features'
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={handleUpgrade}
                                        isLoading={loading}
                                        className="w-full h-12 text-base"
                                    >
                                        Join Now
                                    </Button>
                                    <p className="mt-4 text-xs text-center text-slate-400">
                                        Secure payment powered by Whop. Cancel anytime.
                                    </p>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
