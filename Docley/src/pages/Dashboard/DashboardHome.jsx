import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    FileText,
    TrendingUp,
    Clock,
    AlertCircle,
    Plus,
    ChevronRight,
    ShieldCheck,
    Sparkles,
    ArrowRight,
    Zap,
    CheckCircle2,
    BarChart3,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ContentIntakeModal } from '../../components/modals/ContentIntakeModal';
import { IntakeModal } from '../../components/modals/IntakeModal';
import { getDocuments } from '../../services/documentsService';

export default function DashboardHome() {
    const [showContentModal, setShowContentModal] = useState(false);
    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [intakeContent, setIntakeContent] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load recent documents
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await getDocuments({ limit: 6 });
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContentContinue = (content) => {
        setIntakeContent(content);
        setShowContentModal(false);
        setShowIntakeModal(true);
    };

    const handleIntakeClose = () => {
        setShowIntakeModal(false);
        setIntakeContent(null);
        // Reload documents after creating new one
        loadDocuments();
    };

    const handleIntakeBack = () => {
        setShowIntakeModal(false);
        setShowContentModal(true);
    };

    const formatDate = (dateString) => {
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
        <div className="space-y-8">
            {/* Modals */}
            <ContentIntakeModal
                isOpen={showContentModal}
                onClose={() => setShowContentModal(false)}
                onContinue={handleContentContinue}
            />
            <IntakeModal
                isOpen={showIntakeModal}
                onClose={handleIntakeClose}
                onBack={handleIntakeBack}
                initialContent={intakeContent}
            />

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-orange-50/30 border border-indigo-100/50 p-8 md:p-10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 w-fit">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                Academic Transformer
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                            Transform your rough draft into{' '}
                            <span className="bg-gradient-to-r from-indigo-600 to-orange-600 bg-clip-text text-transparent">
                                submission-ready
                            </span>{' '}
                            work
                        </h1>
                        <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed">
                            Start with your own work, run diagnostics, then transform it into clear, structured, and
                            academically safe writing—before you submit.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                onClick={() => setShowContentModal(true)}
                                className="w-full sm:w-auto shadow-xl shadow-orange-500/25 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white text-base px-6 py-3 h-auto"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Upgrade New Assignment
                            </Button>
                            <Link to="/dashboard/documents">
                                <Button variant="outline" className="w-full sm:w-auto text-base px-6 py-3 h-auto border-slate-300 hover:bg-slate-50">
                                    View All Documents
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-indigo-200/20 rounded-full blur-3xl -z-0"></div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <Card className="border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-white hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <FileText className="h-4 w-4" />
                                    Structure Quality
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-slate-900">B+</h3>
                                    <span className="text-xs text-slate-500">Average</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Your drafts show solid outline and paragraph structure
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-100 bg-gradient-to-br from-white via-green-50/30 to-white hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <TrendingUp className="h-4 w-4" />
                                    Academic Tone
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-slate-900">A-</h3>
                                    <span className="text-xs text-slate-500">Strong</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Consistently matches formal academic language standards
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Zap className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-100 bg-gradient-to-br from-white via-amber-50/30 to-white hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <ShieldCheck className="h-4 w-4" />
                                    Plagiarism Risk
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-slate-900">Low</h3>
                                    <span className="text-xs text-slate-500">Safe</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Transformations prioritize originality and safe paraphrasing
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transformation Journey */}
            <Card className="border-slate-200 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 shadow-sm">
                <CardContent className="p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Transformation Journey</h2>
                        <p className="text-sm text-slate-600">
                            Follow these four steps for every assignment. No guesswork, just a clear path to a stronger draft.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { step: 1, label: 'Upload or Paste', sub: 'Bring your own writing', icon: FileText },
                            { step: 2, label: 'Run Diagnostics', sub: 'Tone, structure, citations', icon: BarChart3 },
                            { step: 3, label: 'Apply Upgrade', sub: 'Rewrite in academic style', icon: Zap },
                            { step: 4, label: 'Review & Export', sub: 'Download and submit', icon: CheckCircle2 },
                        ].map((item, index) => (
                            <div
                                key={item.step}
                                className="relative bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                        {item.step}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <item.icon className="h-4 w-4 text-indigo-600" />
                                            <h3 className="font-semibold text-slate-900 text-sm">{item.label}</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{item.sub}</p>
                                    </div>
                                </div>
                                {index < 3 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                                        <ChevronRight className="h-5 w-5 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Documents */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Recent Documents</h2>
                        <p className="text-sm text-slate-500">
                            Pick up where you left off, compare before/after, or refine one more time.
                        </p>
                    </div>
                    <Link to="/dashboard/documents">
                        <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="h-48 animate-pulse bg-slate-100 border-slate-200" />
                        ))}
                    </div>
                ) : documents.length === 0 ? (
                    <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents yet</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                Create your first document to start transforming your academic work.
                            </p>
                            <Button
                                onClick={() => setShowContentModal(true)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Create Document
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {documents.map((doc) => (
                            <Link
                                to={`/dashboard/editor/${doc.id}`}
                                key={doc.id}
                                className="group block h-full"
                            >
                                <Card className="h-full border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 bg-white">
                                    <CardContent className="p-6 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${doc.status === 'upgraded'
                                                        ? 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            {doc.status === 'upgraded' ? (
                                                <div className="text-right">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                                                            Upgraded
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                                                    <AlertCircle className="h-3 w-3 text-amber-600" />
                                                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                                                        {doc.status === 'diagnosed' ? 'Diagnosed' : 'Draft'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                                                {doc.title}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDate(doc.updated_at)}
                                                </span>
                                                <span>•</span>
                                                <span>{doc.word_count?.toLocaleString() || 0} words</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                                                View & Edit
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
