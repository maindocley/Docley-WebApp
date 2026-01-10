import React, { useState } from 'react';
import {
    X,
    Link as LinkIcon,
    FileText,
    Languages,
    Quote,
    Copy,
    Plus,
    Loader2,
    Sparkles,
    Check
} from 'lucide-react';
import { Button } from '../ui/Button';
import apiClient from '../../api/client';

export const CitationModal = ({ isOpen, onClose, onInsert, currentStyle = 'APA 7th Edition' }) => {
    const [source, setSource] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!source.trim()) {
            setError('Please provide source information (URL or title)');
            return;
        }

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await apiClient.post('/ai/transform', {
                text: source,
                instruction: currentStyle,
                mode: 'citation'
            });

            setResult(response.data);
        } catch (err) {
            console.error('Citation error:', err);
            setError('Failed to generate citation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = result.citation;
        navigator.clipboard.writeText(tempDiv.innerText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Quote className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">AI Citation Assistant</h2>
                            <p className="text-xs text-slate-500">Format using {currentStyle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Input Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700">Source Information</label>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium italic">Paste URL or Article Title</span>
                        </div>
                        <div className="relative">
                            <textarea
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="e.g., https://nature.com/articles/s41586-023-0123-x or 'The impact of AI on higher education Smith 2024'"
                                className="w-full h-24 p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none group-hover:bg-white"
                            />
                            <div className="absolute bottom-3 right-3 flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleGenerate}
                                    disabled={isLoading || !source.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-xs text-red-500 flex items-center gap-1.5"><X className="h-3 w-3" /> {error}</p>}
                    </div>

                    {/* Result Section */}
                    {result && (
                        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 relative group">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Check className="h-3 w-3" /> Full Citation
                                </p>
                                <div
                                    className="text-sm text-slate-800 leading-relaxed italic pr-12"
                                    dangerouslySetInnerHTML={{ __html: result.citation }}
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={handleCopy}
                                        title="Copy to clipboard"
                                        className="h-8 w-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 text-center">In-Text Citation</p>
                                    <p className="text-sm font-semibold text-slate-700 text-center">{result.short_citation}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => onInsert(result.citation)}
                                    className="h-auto py-3 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex flex-col items-center justify-center gap-1 group"
                                >
                                    <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold">Add to Document</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Powered by Gemini AI • Always verify formatting.
                    </p>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};
