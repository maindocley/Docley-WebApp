import { X, CheckCircle2, AlertCircle, TrendingUp, Info, BarChart3, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useEffect, useState } from 'react';
import { analyzeDocument } from '../../services/aiService';

export function DiagnosticReport({ isOpen, onClose, documentText }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && documentText) {
            setLoading(true);
            setError(null);

            // Artificial delay for better UX if response is too fast, or just real fetch
            analyzeDocument(documentText)
                .then(result => {
                    setData(result);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setError("Failed to analyze document. Please ensure you are connected to the internet and deployed the backend.");
                    setLoading(false);
                });
        }
    }, [isOpen, documentText]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/30 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">Diagnostic Report</h2>
                            <p className="text-sm text-slate-500">Comprehensive analysis of your document</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Analyzing Document...</h3>
                            <p className="text-slate-500">Evaluating structure, tone, and clarity</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">Analysis Failed</h3>
                            <p className="text-slate-500 max-w-md mx-auto mt-2">{error}</p>
                            <Button variant="outline" className="mt-6" onClick={onClose}>Close</Button>
                        </div>
                    ) : data ? (
                        <>
                            {/* Overall Score */}
                            <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg shadow-indigo-600/25">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5" />
                                            Overall Grade Prediction
                                        </h3>
                                        <p className="text-indigo-100 text-sm">Based on current academic standards</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-5xl font-black tracking-tight">{data.overallGrade || 'N/A'}</div>
                                        <div className="text-sm text-indigo-200 mt-1">{data.overallGradeText || 'Not Graded'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Scores */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {data.scores?.map((item) => (
                                    <div
                                        key={item.label}
                                        className="bg-gradient-to-br from-white to-slate-50/50 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-indigo-100 h-8 w-8 rounded-lg flex items-center justify-center">
                                                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <span className="font-semibold text-slate-700 text-sm">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-lg text-indigo-600">
                                                {item.score}/100
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                                style={{ width: `${item.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actionable Feedback */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-100 font-semibold text-slate-900 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-indigo-600" />
                                    Key Improvements & Insights
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {data.improvements?.map((item, idx) => (
                                        <div key={idx} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                                            <div
                                                className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'warning'
                                                        ? 'bg-amber-100'
                                                        : item.type === 'info'
                                                            ? 'bg-blue-100'
                                                            : 'bg-green-100'
                                                    }`}
                                            >
                                                {item.type === 'warning' ? <AlertCircle className="h-5 w-5 text-amber-600" /> :
                                                    item.type === 'info' ? <Info className="h-5 w-5 text-blue-600" /> :
                                                        <CheckCircle2 className="h-5 w-5 text-green-600" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900 mb-1">{item.title}</p>
                                                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <Button variant="outline" onClick={onClose} className="border-slate-200">
                        Close Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
