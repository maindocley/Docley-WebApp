import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldCheck, Zap, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const ONBOARDING_STORAGE_KEY = 'docley_onboarding_completed';

export function OnboardingFlow({ onComplete }) {
    const [step, setStep] = useState(1);

    // Check if onboarding was already completed
    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (completed === 'true') {
            onComplete();
        }
    }, [onComplete]);

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else {
            // Mark as completed and close
            localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/30 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {step === 1 ? 'Welcome to Docley' : 'Getting Started'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className={`h-2 w-2 rounded-full transition-all ${step === 1 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                            <div className={`h-2 w-2 rounded-full transition-all ${step === 2 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    {step === 1 ? (
                        // Academic Safety Step
                        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 mb-4">
                                    <ShieldCheck className="h-10 w-10 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Academic Safety First</h3>
                                <p className="text-slate-600 max-w-xl mx-auto">
                                    Understanding how Docley protects your academic integrity
                                </p>
                            </div>

                            <Card className="border-slate-200 bg-white shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900 mb-2">Your Work, Your Voice</h4>
                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                Academic Transformer upgrades the work you already wrote—it does not replace you or generate
                                                full assignments from scratch. This helps you stay closer to your own voice while reducing risk.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-3">
                                <h4 className="font-semibold text-slate-900">How We Keep You Safe:</h4>
                                {[
                                    'Highlights weak structure, tone issues, and missing citations',
                                    'Encourages you to review every change before exporting',
                                    'Keeps a clear separation between your draft and the upgraded version',
                                    'Prioritizes originality and safe paraphrasing techniques',
                                ].map((item, idx) => (
                                    <Card key={idx} className="border-slate-200 bg-gradient-to-r from-white to-slate-50/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                                    </div>
                                    <p className="text-sm text-indigo-900 leading-relaxed">
                                        <span className="font-semibold">Remember:</span> Docley is a transformation tool, not a replacement for your work. 
                                        Always review changes and ensure the final output reflects your understanding and voice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Quick Guide Step
                        <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 mb-4">
                                    <Zap className="h-10 w-10 text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Quick Start Guide</h3>
                                <p className="text-slate-600 max-w-xl mx-auto">
                                    Follow these simple steps to transform your first assignment
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    {
                                        step: 1,
                                        title: 'Create Your Document',
                                        description: 'Click "Upgrade New Assignment" and enter basic details like title, type, academic level, and citation style.',
                                    },
                                    {
                                        step: 2,
                                        title: 'Paste Your Draft',
                                        description: 'Copy and paste your rough draft into the rich text editor. You can also upload a document file (.docx or .pdf).',
                                    },
                                    {
                                        step: 3,
                                        title: 'Run Diagnostics',
                                        description: 'Click "Run Diagnostics" to get a comprehensive analysis of your document\'s structure, tone, clarity, and citation quality.',
                                    },
                                    {
                                        step: 4,
                                        title: 'Apply the Upgrade',
                                        description: 'Review the diagnostic report, then click "Run Upgrade" to transform your draft into submission-ready academic writing.',
                                    },
                                    {
                                        step: 5,
                                        title: 'Review & Export',
                                        description: 'Review all changes in the editor, make any adjustments, then export as DOCX or PDF and submit with confidence.',
                                    },
                                ].map((item) => (
                                    <Card key={item.step} className="border-slate-200 bg-white hover:shadow-md transition-shadow">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {item.step}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900 mb-1.5">{item.title}</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5">
                                <div className="flex items-start gap-3">
                                    <Zap className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-900 mb-1">Ready to get started?</p>
                                        <p className="text-sm text-indigo-700 leading-relaxed">
                                            You're all set! Head to your dashboard to create your first document upgrade.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/25 min-w-[120px]"
                    >
                        {step === 1 ? (
                            <>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Helper function to check if onboarding is completed
export function isOnboardingCompleted() {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

// Helper function to reset onboarding (for testing)
export function resetOnboarding() {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}










