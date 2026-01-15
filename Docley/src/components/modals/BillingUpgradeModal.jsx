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
            const { redirectUrl } = await paymentsService.createCheckoutSession();
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                throw new Error('No redirect URL returned from server');
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

                                <div className="mt-2 relative">
                                    {/* Most Popular Badge */}
                                    <div className="absolute -top-12 right-0">
                                        <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>

                                    <div className="flex flex-col mb-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                                                Pro Student
                                            </h4>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            For serious academic success
                                        </p>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-4xl font-bold text-slate-900 dark:text-white">
                                                $12
                                            </span>
                                            <span className="ml-1 text-slate-500 dark:text-slate-400">
                                                /month
                                            </span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {[
                                            { text: 'Unlimited Transformations', important: true },
                                            { text: 'Advanced Tone Fixing', important: true },
                                            { text: 'Full Citation Generator (APA7, MLA9)', important: false },
                                            { text: 'Plagiarism Risk Checks', important: false },
                                            { text: 'Priority Support', important: false }
                                        ].map((feature, i) => (
                                            <li key={i} className={`flex items-center gap-3 text-sm ${feature.important ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
                                                <Check className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                                {feature.text}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={handleUpgrade}
                                        isLoading={loading}
                                        className="w-full h-12 text-base shadow-lg shadow-indigo-500/25 bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        Upgrade to Pro
                                    </Button>
                                    <p className="mt-4 text-[10px] text-center text-slate-400 uppercase tracking-wider font-medium">
                                        Secure payment powered by Whop • Cancel anytime
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
