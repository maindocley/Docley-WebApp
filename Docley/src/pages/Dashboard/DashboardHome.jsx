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
    Activity,
    Target,
    Award,
    Rocket,
    BookOpen,
    Lightbulb,
    TrendingDown,
    Crown,
    Gauge,
    Flame,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ContentIntakeModal } from '../../components/modals/ContentIntakeModal';
import { IntakeModal } from '../../components/modals/IntakeModal';
import { getDocuments } from '../../services/documentsService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { TemplateSelectionModal } from '../../components/modals/TemplateSelectionModal.jsx';

export default function DashboardHome() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showContentModal, setShowContentModal] = useState(false);
    const [showTemplateSelectionModal, setShowTemplateSelectionModal] = useState(false);
    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [intakeContent, setIntakeContent] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        totalWords: 0,
        upgradedCount: 0,
        recentActivity: []
    });



    // ... inside component
    // Load recent documents and setup real-time subscription
    useEffect(() => {
        loadDocuments();

        // Real-time subscription
        const channel = supabase
            .channel('dashboard_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'documents'
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    loadDocuments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await getDocuments({ limit: 6 });
            setDocuments(docs);

            // Calculate stats
            const allDocs = await getDocuments();
            const totalWords = allDocs.reduce((sum, doc) => sum + (doc.word_count || 0), 0);
            const upgradedCount = allDocs.filter(doc => doc.status === 'upgraded').length;

            // Get recent activity (last 5 documents)
            const recentActivity = allDocs
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .slice(0, 5);

            setStats({
                totalDocuments: allDocs.length,
                totalWords,
                upgradedCount,
                recentActivity
            });
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

    const handleTemplateSelection = (selectedTemplateContent) => {
        setShowTemplateSelectionModal(false);
        if (selectedTemplateContent) {
            // Format template content for IntakeModal
            const formattedContent = {
                content: selectedTemplateContent,
                contentHtml: `<div style="font-size: 12pt;">${selectedTemplateContent.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '<p><br></p>').join('')}</div>`,
                inputType: 'template'
            };
            setIntakeContent(formattedContent);
            setShowIntakeModal(true); // Skip ContentIntakeModal
        } else {
            setIntakeContent(null); // Start with blank document
            setShowContentModal(true); // Go to default workflow
        }
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

    // Get user's display name
    const getUserDisplayName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name.split(' ')[0]; // First name only
        }
        if (user?.email) {
            return user.email.split('@')[0]; // Username from email
        }
        return 'there';
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

            <TemplateSelectionModal
                isOpen={showTemplateSelectionModal}
                onClose={() => setShowTemplateSelectionModal(false)}
                onTemplateSelect={handleTemplateSelection}
            />

            {/* Welcome Message with Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Welcome Card */}
                <div className={cn(
                    "lg:col-span-2 rounded-2xl border p-6 backdrop-blur-xl",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "bg-gradient-to-br from-indigo-50 via-white to-orange-50/30 border-indigo-100/50"
                )}>
                    <h1 className={cn(
                        "text-3xl md:text-4xl font-bold mb-2",
                        isDark ? "text-white" : "text-slate-900"
                    )}>
                        Welcome back, {getUserDisplayName()}! 👋
                    </h1>
                    <p className={cn(
                        "text-base md:text-lg mb-4",
                        isDark ? "text-slate-300" : "text-slate-600"
                    )}>
                        Ready to transform your next assignment into submission-ready work?
                    </p>

                    {/* Quick Stats Row */}
                    <div className="flex flex-wrap gap-4 mt-4">
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                            isDark ? "bg-white/5" : "bg-white/60"
                        )}>
                            <FileText className={cn(
                                "h-4 w-4",
                                isDark ? "text-orange-400" : "text-orange-600"
                            )} />
                            <span className={cn(
                                "text-sm font-semibold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                {stats.totalDocuments} {stats.totalDocuments === 1 ? 'Document' : 'Documents'}
                            </span>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                            isDark ? "bg-white/5" : "bg-white/60"
                        )}>
                            <BookOpen className={cn(
                                "h-4 w-4",
                                isDark ? "text-blue-400" : "text-blue-600"
                            )} />
                            <span className={cn(
                                "text-sm font-semibold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                {stats.totalWords.toLocaleString()} words
                            </span>
                        </div>
                        {stats.upgradedCount > 0 && (
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                                isDark ? "bg-white/5" : "bg-white/60"
                            )}>
                                <Rocket className={cn(
                                    "h-4 w-4",
                                    isDark ? "text-green-400" : "text-green-600"
                                )} />
                                <span className={cn(
                                    "text-sm font-semibold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    {stats.upgradedCount} Upgraded
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Usage Progress Card */}
                <div className={cn(
                    "rounded-2xl border p-6 backdrop-blur-xl",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "bg-gradient-to-br from-white via-orange-50/30 to-white border-orange-100/50"
                )}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Gauge className={cn(
                                "h-5 w-5",
                                isDark ? "text-orange-400" : "text-orange-600"
                            )} />
                            <h3 className={cn(
                                "text-sm font-semibold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Usage
                            </h3>
                        </div>
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            isDark
                                ? "bg-orange-500/20 text-orange-400"
                                : "bg-orange-100 text-orange-700"
                        )}>
                            Free
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                            <span className={cn(isDark ? "text-slate-400" : "text-slate-600")}>
                                Documents this month
                            </span>
                            <span className={cn(
                                "font-semibold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                {stats.totalDocuments} / 3
                            </span>
                        </div>
                        <div className={cn(
                            "h-2 rounded-full overflow-hidden",
                            isDark ? "bg-white/10" : "bg-slate-200"
                        )}>
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    stats.totalDocuments >= 3
                                        ? "bg-red-500"
                                        : stats.totalDocuments >= 2
                                            ? "bg-orange-500"
                                            : "bg-green-500"
                                )}
                                style={{ width: `${Math.min((stats.totalDocuments / 3) * 100, 100)}%` }}
                            />
                        </div>
                        {stats.totalDocuments >= 3 && (
                            <p className={cn(
                                "text-xs flex items-center gap-1",
                                isDark ? "text-red-400" : "text-red-600"
                            )}>
                                <AlertCircle className="h-3 w-3" />
                                Limit reached. Upgrade to Pro for unlimited access.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Compact Hero Section */}
            <div className={cn(
                "rounded-xl border p-4 md:p-5 backdrop-blur-xl",
                isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-gradient-to-r from-indigo-50/50 to-orange-50/30 border-indigo-100/50"
            )}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1 rounded-full border",
                                isDark
                                    ? "bg-white/10 border-white/20"
                                    : "bg-white/80 border-indigo-100"
                            )}>
                                <Sparkles className={cn(
                                    "h-3 w-3",
                                    isDark ? "text-orange-400" : "text-orange-600"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-semibold uppercase tracking-wide",
                                    isDark ? "text-white/90" : "text-indigo-700"
                                )}>
                                    Academic Transformer
                                </span>
                            </div>
                        </div>
                        <h2 className={cn(
                            "text-lg md:text-xl font-bold leading-tight mb-1",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Transform drafts into{' '}
                            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                                submission-ready
                            </span>{' '}
                            work
                        </h2>
                        <p className={cn(
                            "text-xs md:text-sm leading-relaxed line-clamp-2",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            Run diagnostics, then transform into clear, structured, and academically safe writing.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Button
                            onClick={() => setShowTemplateSelectionModal(true)}
                            className="shadow-lg shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white text-sm px-4 py-2 h-auto whitespace-nowrap"
                        >
                            <Plus className="mr-1.5 h-4 w-4" /> New Assignment
                        </Button>
                        <Link to="/dashboard/documents">
                            <Button
                                variant="outline"
                                className={cn(
                                    "text-sm px-4 py-2 h-auto whitespace-nowrap",
                                    isDark
                                        ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                                        : "border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                View All
                                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className={cn(
                    "lg:col-span-1 hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-slate-200 bg-gradient-to-br from-white via-purple-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className={cn(
                                "h-5 w-5",
                                isDark ? "text-purple-400" : "text-purple-600"
                            )} />
                            <h3 className={cn(
                                "text-lg font-bold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Quick Actions
                            </h3>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => setShowTemplateSelectionModal(true)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:scale-[1.02]",
                                    isDark
                                        ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                        : "bg-white hover:bg-purple-50 text-slate-900 border border-slate-200 shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center",
                                    isDark ? "bg-orange-500/20" : "bg-orange-100"
                                )}>
                                    <Plus className={cn(
                                        "h-5 w-5",
                                        isDark ? "text-orange-400" : "text-orange-600"
                                    )} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        New Document
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Start a new assignment
                                    </p>
                                </div>
                            </button>
                            <Link
                                to="/dashboard/documents"
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:scale-[1.02]",
                                    isDark
                                        ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                        : "bg-white hover:bg-purple-50 text-slate-900 border border-slate-200 shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center",
                                    isDark ? "bg-blue-500/20" : "bg-blue-100"
                                )}>
                                    <FileText className={cn(
                                        "h-5 w-5",
                                        isDark ? "text-blue-400" : "text-blue-600"
                                    )} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        View All Documents
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Manage your work
                                    </p>
                                </div>
                            </Link>
                            <Link
                                to="/dashboard/settings"
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:scale-[1.02]",
                                    isDark
                                        ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                        : "bg-white hover:bg-purple-50 text-slate-900 border border-slate-200 shadow-sm"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center",
                                    isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                                )}>
                                    <Sparkles className={cn(
                                        "h-5 w-5",
                                        isDark ? "text-indigo-400" : "text-indigo-600"
                                    )} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        Settings
                                    </p>
                                    <p className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Customize preferences
                                    </p>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className={cn(
                    "lg:col-span-2 hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-slate-200 bg-gradient-to-br from-white via-blue-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className={cn(
                                    "h-5 w-5",
                                    isDark ? "text-blue-400" : "text-blue-600"
                                )} />
                                <h3 className={cn(
                                    "text-lg font-bold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    Recent Activity
                                </h3>
                            </div>
                            <Link
                                to="/dashboard/documents"
                                className={cn(
                                    "text-xs font-medium transition-colors",
                                    isDark
                                        ? "text-blue-400 hover:text-blue-300"
                                        : "text-blue-600 hover:text-blue-700"
                                )}
                            >
                                View All
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {stats.recentActivity.length === 0 ? (
                                <div className={cn(
                                    "text-center py-8",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No activity yet</p>
                                    <p className="text-xs mt-1">Create your first document to get started</p>
                                </div>
                            ) : (
                                stats.recentActivity.slice(0, 4).map((doc, index) => (
                                    <Link
                                        key={doc.id}
                                        to={`/dashboard/editor/${doc.id}`}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg transition-all hover:scale-[1.01]",
                                            isDark
                                                ? "hover:bg-white/5 border border-white/5"
                                                : "hover:bg-white border border-slate-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                            doc.status === 'upgraded'
                                                ? isDark ? "bg-green-500/20" : "bg-green-100"
                                                : isDark ? "bg-slate-700" : "bg-slate-100"
                                        )}>
                                            {doc.status === 'upgraded' ? (
                                                <CheckCircle2 className={cn(
                                                    "h-5 w-5",
                                                    isDark ? "text-green-400" : "text-green-600"
                                                )} />
                                            ) : (
                                                <FileText className={cn(
                                                    "h-5 w-5",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm font-semibold truncate",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>
                                                {doc.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={cn(
                                                    "text-xs",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    {formatDate(doc.updated_at)}
                                                </span>
                                                <span className={cn(
                                                    "text-xs",
                                                    isDark ? "text-slate-500" : "text-slate-400"
                                                )}>
                                                    •
                                                </span>
                                                <span className={cn(
                                                    "text-xs",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    {doc.word_count?.toLocaleString() || 0} words
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "h-4 w-4 flex-shrink-0",
                                            isDark ? "text-slate-500" : "text-slate-400"
                                        )} />
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Achievement Badges */}
            {stats.totalDocuments > 0 && (
                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-slate-200 bg-gradient-to-br from-white via-amber-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Award className={cn(
                                "h-5 w-5",
                                isDark ? "text-amber-400" : "text-amber-600"
                            )} />
                            <h3 className={cn(
                                "text-lg font-bold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Achievements
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.totalDocuments >= 1 && (
                                <div className={cn(
                                    "flex flex-col items-center p-4 rounded-xl border",
                                    isDark
                                        ? "bg-white/5 border-white/10"
                                        : "bg-white border-slate-200"
                                )}>
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center mb-2",
                                        isDark ? "bg-green-500/20" : "bg-green-100"
                                    )}>
                                        <Target className={cn(
                                            "h-6 w-6",
                                            isDark ? "text-green-400" : "text-green-600"
                                        )} />
                                    </div>
                                    <p className={cn(
                                        "text-xs font-semibold text-center",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        First Document
                                    </p>
                                </div>
                            )}
                            {stats.totalDocuments >= 5 && (
                                <div className={cn(
                                    "flex flex-col items-center p-4 rounded-xl border",
                                    isDark
                                        ? "bg-white/5 border-white/10"
                                        : "bg-white border-slate-200"
                                )}>
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center mb-2",
                                        isDark ? "bg-blue-500/20" : "bg-blue-100"
                                    )}>
                                        <Flame className={cn(
                                            "h-6 w-6",
                                            isDark ? "text-blue-400" : "text-blue-600"
                                        )} />
                                    </div>
                                    <p className={cn(
                                        "text-xs font-semibold text-center",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        Getting Started
                                    </p>
                                </div>
                            )}
                            {stats.upgradedCount >= 1 && (
                                <div className={cn(
                                    "flex flex-col items-center p-4 rounded-xl border",
                                    isDark
                                        ? "bg-white/5 border-white/10"
                                        : "bg-white border-slate-200"
                                )}>
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center mb-2",
                                        isDark ? "bg-purple-500/20" : "bg-purple-100"
                                    )}>
                                        <Rocket className={cn(
                                            "h-6 w-6",
                                            isDark ? "text-purple-400" : "text-purple-600"
                                        )} />
                                    </div>
                                    <p className={cn(
                                        "text-xs font-semibold text-center",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        First Upgrade
                                    </p>
                                </div>
                            )}
                            {stats.totalWords >= 10000 && (
                                <div className={cn(
                                    "flex flex-col items-center p-4 rounded-xl border",
                                    isDark
                                        ? "bg-white/5 border-white/10"
                                        : "bg-white border-slate-200"
                                )}>
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center mb-2",
                                        isDark ? "bg-orange-500/20" : "bg-orange-100"
                                    )}>
                                        <Crown className={cn(
                                            "h-6 w-6",
                                            isDark ? "text-orange-400" : "text-orange-600"
                                        )} />
                                    </div>
                                    <p className={cn(
                                        "text-xs font-semibold text-center",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        10K Words
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className={cn(
                                    "flex items-center gap-2 text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    <FileText className="h-4 w-4 hidden md:block" />
                                    Structure Quality
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={cn(
                                        "text-3xl font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        B+
                                    </h3>
                                    <span className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Average
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    Your drafts show solid outline and paragraph structure
                                </p>
                            </div>
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 hidden md:flex",
                                isDark
                                    ? "bg-indigo-500/20"
                                    : "bg-indigo-100"
                            )}>
                                <BarChart3 className={cn(
                                    "h-6 w-6",
                                    isDark ? "text-indigo-400" : "text-indigo-600"
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-green-100 bg-gradient-to-br from-white via-green-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className={cn(
                                    "flex items-center gap-2 text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    <TrendingUp className="h-4 w-4 hidden md:block" />
                                    Academic Tone
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={cn(
                                        "text-3xl font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        A-
                                    </h3>
                                    <span className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Strong
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    Consistently matches formal academic language standards
                                </p>
                            </div>
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 hidden md:flex",
                                isDark
                                    ? "bg-green-500/20"
                                    : "bg-green-100"
                            )}>
                                <Zap className={cn(
                                    "h-6 w-6",
                                    isDark ? "text-green-400" : "text-green-600"
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-amber-100 bg-gradient-to-br from-white via-amber-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className={cn(
                                    "flex items-center gap-2 text-sm font-medium",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    <ShieldCheck className="h-4 w-4 hidden md:block" />
                                    Plagiarism Risk
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={cn(
                                        "text-3xl font-bold",
                                        isDark ? "text-white" : "text-slate-900"
                                    )}>
                                        Low
                                    </h3>
                                    <span className={cn(
                                        "text-xs",
                                        isDark ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        Safe
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs leading-relaxed",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    Transformations prioritize originality and safe paraphrasing
                                </p>
                            </div>
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 hidden md:flex",
                                isDark
                                    ? "bg-amber-500/20"
                                    : "bg-amber-100"
                            )}>
                                <ShieldCheck className={cn(
                                    "h-6 w-6",
                                    isDark ? "text-amber-400" : "text-amber-600"
                                )} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Productivity Insights & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productivity Insights */}
                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-slate-200 bg-gradient-to-br from-white via-emerald-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className={cn(
                                "h-5 w-5",
                                isDark ? "text-emerald-400" : "text-emerald-600"
                            )} />
                            <h3 className={cn(
                                "text-lg font-bold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Productivity Insights
                            </h3>
                        </div>
                        <div className="space-y-4">
                            <div className={cn(
                                "p-4 rounded-lg border",
                                isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100"
                            )}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-300" : "text-slate-700"
                                    )}>
                                        Total Words Written
                                    </span>
                                    <span className={cn(
                                        "text-lg font-bold",
                                        isDark ? "text-emerald-400" : "text-emerald-600"
                                    )}>
                                        {stats.totalWords.toLocaleString()}
                                    </span>
                                </div>
                                <div className={cn(
                                    "h-2 rounded-full overflow-hidden",
                                    isDark ? "bg-white/10" : "bg-slate-200"
                                )}>
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((stats.totalWords / 50000) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className={cn(
                                    "text-xs mt-2",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    {stats.totalWords >= 50000
                                        ? "🎉 Amazing progress! You've written over 50K words!"
                                        : `${(50000 - stats.totalWords).toLocaleString()} words until 50K milestone`}
                                </p>
                            </div>
                            <div className={cn(
                                "p-4 rounded-lg border",
                                isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100"
                            )}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "text-sm font-medium",
                                        isDark ? "text-slate-300" : "text-slate-700"
                                    )}>
                                        Upgrade Rate
                                    </span>
                                    <span className={cn(
                                        "text-lg font-bold",
                                        isDark ? "text-blue-400" : "text-blue-600"
                                    )}>
                                        {stats.totalDocuments > 0
                                            ? `${Math.round((stats.upgradedCount / stats.totalDocuments) * 100)}%`
                                            : '0%'}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs",
                                    isDark ? "text-slate-400" : "text-slate-500"
                                )}>
                                    {stats.upgradedCount} of {stats.totalDocuments} documents upgraded
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Tips */}
                <Card className={cn(
                    "hover:shadow-lg transition-all duration-300",
                    isDark
                        ? "bg-white/5 border-white/10"
                        : "border-slate-200 bg-gradient-to-br from-white via-amber-50/30 to-white"
                )}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className={cn(
                                "h-5 w-5",
                                isDark ? "text-amber-400" : "text-amber-600"
                            )} />
                            <h3 className={cn(
                                "text-lg font-bold",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                Quick Tips
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className={cn(
                                "p-3 rounded-lg border-l-4",
                                isDark
                                    ? "bg-white/5 border-orange-500/50"
                                    : "bg-white border-orange-500"
                            )}>
                                <p className={cn(
                                    "text-sm font-medium mb-1",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    💡 Start with Diagnostics
                                </p>
                                <p className={cn(
                                    "text-xs",
                                    isDark ? "text-slate-400" : "text-slate-600"
                                )}>
                                    Run diagnostics first to identify areas for improvement before upgrading.
                                </p>
                            </div>
                            <div className={cn(
                                "p-3 rounded-lg border-l-4",
                                isDark
                                    ? "bg-white/5 border-blue-500/50"
                                    : "bg-white border-blue-500"
                            )}>
                                <p className={cn(
                                    "text-sm font-medium mb-1",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    📝 Review Before Submitting
                                </p>
                                <p className={cn(
                                    "text-xs",
                                    isDark ? "text-slate-400" : "text-slate-600"
                                )}>
                                    Always review the upgraded content and make final adjustments to match your voice.
                                </p>
                            </div>
                            <div className={cn(
                                "p-3 rounded-lg border-l-4",
                                isDark
                                    ? "bg-white/5 border-green-500/50"
                                    : "bg-white border-green-500"
                            )}>
                                <p className={cn(
                                    "text-sm font-medium mb-1",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    🎯 Use Citations
                                </p>
                                <p className={cn(
                                    "text-xs",
                                    isDark ? "text-slate-400" : "text-slate-600"
                                )}>
                                    Add citations to strengthen your arguments and avoid plagiarism concerns.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Documents */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className={cn(
                            "text-2xl font-bold mb-1",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Recent Documents
                        </h2>
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                            Pick up where you left off, compare before/after, or refine one more time.
                        </p>
                    </div>
                    <Link to="/dashboard/documents">
                        <Button
                            variant="ghost"
                            className={cn(
                                isDark
                                    ? "text-orange-400 hover:text-orange-300 hover:bg-white/10"
                                    : "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            )}
                        >
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
                    <Card className={cn(
                        "border-dashed border-2",
                        isDark
                            ? "border-white/10 bg-white/5"
                            : "border-slate-200 bg-slate-50/50"
                    )}>
                        <CardContent className="p-12 text-center">
                            <div className={cn(
                                "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                                isDark ? "bg-white/10" : "bg-slate-100"
                            )}>
                                <FileText className={cn(
                                    "h-8 w-8",
                                    isDark ? "text-slate-500" : "text-slate-400"
                                )} />
                            </div>
                            <h3 className={cn(
                                "text-lg font-semibold mb-2",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                No documents yet
                            </h3>
                            <p className={cn(
                                "text-sm mb-6",
                                isDark ? "text-slate-400" : "text-slate-500"
                            )}>
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
                                <Card className={cn(
                                    "h-full hover:shadow-lg transition-all duration-300",
                                    isDark
                                        ? "bg-white/5 border-white/10 hover:border-orange-500/30"
                                        : "border-slate-200 hover:border-indigo-300 bg-white"
                                )}>
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
                                            <h3 className={cn(
                                                "text-base font-bold line-clamp-2 leading-snug transition-colors",
                                                isDark
                                                    ? "text-white group-hover:text-orange-400"
                                                    : "text-slate-900 group-hover:text-indigo-600"
                                            )}>
                                                {doc.title}
                                            </h3>
                                            <div className={cn(
                                                "flex items-center gap-3 text-xs",
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            )}>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5 hidden md:block" />
                                                    {formatDate(doc.updated_at)}
                                                </span>
                                                <span>•</span>
                                                <span>{doc.word_count?.toLocaleString() || 0} words</span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "pt-4 mt-4 border-t flex items-center justify-between",
                                            isDark ? "border-white/10" : "border-slate-100"
                                        )}>
                                            <span className={cn(
                                                "text-xs font-medium transition-colors",
                                                isDark
                                                    ? "text-slate-400 group-hover:text-orange-400"
                                                    : "text-slate-500 group-hover:text-indigo-600"
                                            )}>
                                                View & Edit
                                            </span>
                                            <ChevronRight className={cn(
                                                "h-4 w-4 transition-all",
                                                isDark
                                                    ? "text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1"
                                                    : "text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1"
                                            )} />
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
