import { useState } from 'react';
import { X, FileText, ChevronRight, GraduationCap, Quote, Type, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { createDocument } from '../../services/documentsService';

export function IntakeModal({ isOpen, onClose, onBack, initialContent = null }) {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Essay',
        level: 'undergraduate',
        style: 'APA 7th Edition',
    });

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            addToast('Please enter a document title', 'warning');
            return;
        }

        setIsLoading(true);

        try {
            // Create document in database
            const document = await createDocument({
                title: formData.title,
                content: initialContent?.content || '',
                contentHtml: initialContent?.contentHtml || (initialContent?.content ? `<p>${initialContent.content}</p>` : ''),
                academicLevel: formData.level,
                citationStyle: formData.style,
                documentType: formData.type,
                fileName: initialContent?.file?.name || null,
                fileSize: initialContent?.file?.size || null,
            });

            addToast('Document created successfully', 'success');
            navigate(`/dashboard/editor/${document.id}`, {
                state: {
                    ...formData,
                    content: initialContent?.content || '',
                    isNew: true,
                }
            });
            onClose();
        } catch (error) {
            console.error('Error creating document:', error);
            addToast(error.message || 'Failed to create document', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const citationStyles = [
        { value: 'APA 7th Edition', label: 'APA 7th' },
        { value: 'MLA 9th Edition', label: 'MLA 9th' },
        { value: 'Harvard', label: 'Harvard' },
        { value: 'Chicago', label: 'Chicago' },
    ];

    const academicLevels = [
        { value: 'undergraduate', label: 'Undergraduate' },
        { value: 'postgraduate', label: 'Postgraduate' },
        { value: 'masters', label: 'Masters' },
        { value: 'phd', label: 'PhD' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/30 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 mr-1"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                        )}
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Document Details</h2>
                            <p className="text-xs text-slate-500">Set up your assignment details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content Preview (if content provided) */}
                {initialContent?.content && (
                    <div className="px-6 pt-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-900">Content ready</p>
                                <p className="text-xs text-green-700 truncate">
                                    {initialContent.content.split(/\s+/).filter(Boolean).length} words •
                                    {initialContent.file ? ` ${initialContent.file.name}` : ' Pasted text'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            Document Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., The Impact of AI on Modern Education"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            autoFocus
                        />
                        <p className="text-xs text-slate-500">Give your assignment a clear, descriptive title</p>
                    </div>

                    {/* Type and Level */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Type className="h-4 w-4 text-indigo-600" />
                                Document Type
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Essay</option>
                                <option>Research Paper</option>
                                <option>Thesis</option>
                                <option>Case Study</option>
                                <option>Report</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-indigo-600" />
                                Academic Level
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            >
                                {academicLevels.map((level) => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Citation Style */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Quote className="h-4 w-4 text-indigo-600" />
                            Citation Style
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {citationStyles.map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => setFormData({ ...formData, style: style.value })}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all text-left ${formData.style === style.value
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-200 shadow-sm'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="font-semibold">{style.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{style.value}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3 flex-shrink-0">
                    <div>
                        {onBack && (
                            <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:text-slate-900">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} className="text-slate-600 hover:text-slate-900">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!formData.title.trim() || isLoading}
                            isLoading={isLoading}
                            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/25"
                        >
                            Create Document
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
