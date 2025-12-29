import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    FileText,
    Clock,
    MoreVertical,
    Search,
    Filter,
    Plus,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    Grid3x3,
    List,
    SortAsc,
    Loader2,
    Trash2,
    BarChart3,
    ChevronDown,
    X,
    Share2,
    Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { ContentIntakeModal } from '../../components/modals/ContentIntakeModal';
import { IntakeModal } from '../../components/modals/IntakeModal';
import { getDocuments, deleteDocument, permanentlyDeleteDocument } from '../../services/documentsService';

export default function DashboardDocuments() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showContentModal, setShowContentModal] = useState(false);
    const [showIntakeModal, setShowIntakeModal] = useState(false);
    const [intakeContent, setIntakeContent] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('recent');
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
    const [showFilterPopover, setShowFilterPopover] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        academicLevel: '',
        type: 'all'
    });
    const { addToast } = useToast();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Load documents
    useEffect(() => {
        loadDocuments();
    }, [filters]);

    const loadDocuments = async () => {
        setIsLoading(true);
        try {
            const docs = await getDocuments(filters);
            setDocuments(docs);
        } catch (error) {
            console.error('Error loading documents:', error);
            addToast('Failed to load documents', 'error');
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
        loadDocuments();
    };

    const handleIntakeBack = () => {
        setShowIntakeModal(false);
        setShowContentModal(true);
    };

    const handleDelete = async () => {
        if (!deleteConfirmDoc) return;

        try {
            await permanentlyDeleteDocument(deleteConfirmDoc.id);
            addToast(`"${deleteConfirmDoc.title}" deleted permanently`, 'success');
            loadDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            addToast(error.message || 'Failed to delete document', 'error');
        } finally {
            setDeleteConfirmDoc(null);
            setActiveMenu(null);
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

    // Filter documents
    const filteredDocs = documents.filter(
        (doc) =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doc.content && doc.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort documents
    const sortedDocs = [...filteredDocs].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.updated_at) - new Date(a.updated_at);
        } else if (sortBy === 'name') {
            return a.title.localeCompare(b.title);
        } else if (sortBy === 'status') {
            return a.status.localeCompare(b.status);
        }
        return 0;
    });

    const clearFilters = () => {
        setFilters({ status: '', academicLevel: '', type: 'all' });
        setShowFilterPopover(false);
    };

    const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'upgraded':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Upgraded</span>
                    </div>
                );
            case 'diagnosed':
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
                        <BarChart3 className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Diagnosed</span>
                    </div>
                );
            default:
                return (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                        <AlertCircle className="h-3 w-3 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Draft</span>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
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

            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={cn(
                            "text-2xl md:text-3xl font-bold mb-2",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            My Documents
                        </h1>
                        <p className={cn(
                            "text-sm",
                            isDark ? "text-slate-400" : "text-slate-600"
                        )}>
                            Manage and organize all your academic assignments in one place
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowContentModal(true)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none shadow-lg shadow-orange-500/20 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Document
                    </Button>
                </div>

                {/* Search and Controls */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className={cn(
                            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                            isDark ? "text-slate-400" : "text-slate-400"
                        )} />
                        <input
                            type="text"
                            placeholder="Search documents by title or content..."
                            className={cn(
                                "w-full pl-10 pr-4 h-11 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all",
                                isDark
                                    ? "border-white/10 bg-white/5 text-white placeholder-slate-500"
                                    : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                            )}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className={cn(
                                    "appearance-none pl-9 pr-4 h-11 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer",
                                    isDark
                                        ? "border-white/10 bg-white/5 text-white"
                                        : "border-slate-200 bg-white text-slate-900"
                                )}
                            >
                                <option value="recent">Sort by Recent</option>
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                            </select>
                            <SortAsc className={cn(
                                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none",
                                isDark ? "text-slate-400" : "text-slate-400"
                            )} />
                        </div>
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilterPopover(!showFilterPopover)}
                                className={cn(
                                    "h-11 gap-2",
                                    isDark
                                        ? activeFilterCount > 0
                                            ? "bg-orange-500/20 border-orange-500/30 text-orange-400"
                                            : "border-white/10 bg-white/5 text-slate-200"
                                        : activeFilterCount > 0
                                            ? "bg-orange-50 border-orange-200 text-orange-600"
                                            : "border-slate-200"
                                )}
                            >
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline">Filter</span>
                                {activeFilterCount > 0 && (
                                    <span className={cn(
                                        "flex items-center justify-center text-white text-[10px] h-4 w-4 rounded-full",
                                        isDark ? "bg-orange-500" : "bg-orange-600"
                                    )}>
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>

                            {showFilterPopover && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterPopover(false)} />
                                    <div className={cn(
                                        "absolute right-0 top-full mt-2 w-72 rounded-xl shadow-2xl border p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200",
                                        isDark
                                            ? "bg-slate-800 border-white/10"
                                            : "bg-white border-slate-200"
                                    )}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className={cn(
                                                "font-bold",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>
                                                Filter Documents
                                            </h4>
                                            {activeFilterCount > 0 && (
                                                <button
                                                    onClick={clearFilters}
                                                    className={cn(
                                                        "text-xs font-medium transition-colors",
                                                        isDark
                                                            ? "text-orange-400 hover:text-orange-300"
                                                            : "text-orange-600 hover:text-orange-700"
                                                    )}
                                                >
                                                    Clear all
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className={cn(
                                                    "text-xs font-semibold uppercase tracking-wider",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    Status
                                                </label>
                                                <select
                                                    value={filters.status}
                                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                                    className={cn(
                                                        "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all",
                                                        isDark
                                                            ? "border-white/10 bg-white/5 text-white"
                                                            : "border-slate-200 bg-white text-slate-900"
                                                    )}
                                                >
                                                    <option value="">All Statuses</option>
                                                    <option value="draft">Draft</option>
                                                    <option value="diagnosed">Diagnosed</option>
                                                    <option value="upgraded">Upgraded</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className={cn(
                                                    "text-xs font-semibold uppercase tracking-wider",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    Academic Level
                                                </label>
                                                <select
                                                    value={filters.academicLevel}
                                                    onChange={(e) => setFilters({ ...filters, academicLevel: e.target.value })}
                                                    className={cn(
                                                        "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all",
                                                        isDark
                                                            ? "border-white/10 bg-white/5 text-white"
                                                            : "border-slate-200 bg-white text-slate-900"
                                                    )}
                                                >
                                                    <option value="">All Levels</option>
                                                    <option value="High School">High School</option>
                                                    <option value="Undergraduate">Undergraduate</option>
                                                    <option value="Graduate">Graduate</option>
                                                    <option value="Doctoral">Doctoral</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className={cn(
                                                    "text-xs font-semibold uppercase tracking-wider",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    Workspace
                                                </label>
                                                <select
                                                    value={filters.type}
                                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                                    className={cn(
                                                        "w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all",
                                                        isDark
                                                            ? "border-white/10 bg-white/5 text-white"
                                                            : "border-slate-200 bg-white text-slate-900"
                                                    )}
                                                >
                                                    <option value="all">All Documents</option>
                                                    <option value="owned">Owned by me</option>
                                                    <option value="shared">Shared with me</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "mt-6 pt-4 border-t",
                                            isDark ? "border-white/10" : "border-slate-100"
                                        )}>
                                            <Button
                                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
                                                onClick={() => setShowFilterPopover(false)}
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className={cn(
                            "flex items-center border rounded-lg overflow-hidden h-11",
                            isDark ? "border-white/10" : "border-slate-200"
                        )}>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2.5 transition-colors",
                                    viewMode === 'grid'
                                        ? isDark
                                            ? 'bg-orange-500/20 text-orange-400'
                                            : 'bg-orange-50 text-orange-600'
                                        : isDark
                                            ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            : 'bg-white text-slate-500 hover:bg-slate-50'
                                )}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2.5 transition-colors border-l",
                                    isDark ? "border-white/10" : "border-slate-200",
                                    viewMode === 'list'
                                        ? isDark
                                            ? 'bg-orange-500/20 text-orange-400'
                                            : 'bg-orange-50 text-orange-600'
                                        : isDark
                                            ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                                            : 'bg-white text-slate-500 hover:bg-slate-50'
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Display */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="h-48 animate-pulse bg-slate-100 border-slate-200" />
                    ))}
                </div>
            ) : sortedDocs.length > 0 ? (
                viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {sortedDocs.map((doc) => (
                            <Link
                                to={`/dashboard/editor/${doc.id}`}
                                key={doc.id}
                                className="group block h-full"
                            >
                                <Card className={cn(
                                    "h-full hover:shadow-lg transition-all duration-300",
                                    isDark
                                        ? "bg-white/5 border-white/10 hover:border-orange-500/30"
                                        : "border-slate-200 hover:border-orange-300 bg-white"
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
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(doc.status)}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === doc.id ? null : doc.id);
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>
                                                    {activeMenu === doc.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); setActiveMenu(null); }} />
                                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmDoc(doc); }}
                                                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete Document
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2 mb-4">
                                            <h3 className={cn(
                                                "text-base font-bold line-clamp-2 leading-snug transition-colors",
                                                isDark
                                                    ? "text-white group-hover:text-orange-400"
                                                    : "text-slate-900 group-hover:text-orange-600"
                                            )}>
                                                {doc.title}
                                            </h3>
                                            <p className={cn(
                                                "text-sm line-clamp-2 leading-relaxed",
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            )}>
                                                {doc.content?.substring(0, 100) || 'No content yet...'}
                                            </p>
                                            <div className={cn(
                                                "flex items-center gap-3 text-xs pt-2",
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            )}>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDate(doc.updated_at)}
                                                </span>
                                                <span>•</span>
                                                <span>{doc.word_count?.toLocaleString() || 0} words</span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "pt-4 border-t flex items-center justify-between",
                                            isDark ? "border-white/10" : "border-slate-100"
                                        )}>
                                            <span className={cn(
                                                "text-xs font-medium transition-colors",
                                                isDark
                                                    ? "text-slate-400 group-hover:text-orange-400"
                                                    : "text-slate-500 group-hover:text-orange-600"
                                            )}>
                                                Open Document
                                            </span>
                                            <ArrowUpRight className={cn(
                                                "h-4 w-4 transition-all",
                                                isDark
                                                    ? "text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                    : "text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedDocs.map((doc) => (
                            <Link to={`/dashboard/editor/${doc.id}`} key={doc.id} className="block group">
                                <Card className="hover:border-indigo-300 transition-all duration-200 border-slate-200 hover:shadow-md bg-white">
                                    <CardContent className="p-5 flex items-center gap-5">
                                        <div
                                            className={`h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${doc.status === 'upgraded'
                                                ? 'bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600'
                                                : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            <FileText className="h-7 w-7" />
                                        </div>

                                        <div className="flex-1 min-w-0 grid md:grid-cols-4 gap-4 items-center">
                                            <div className="md:col-span-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    {getStatusBadge(doc.status)}
                                                </div>
                                                <p className="text-sm text-slate-500 truncate">
                                                    {doc.content?.substring(0, 80) || 'No content yet...'}
                                                </p>
                                            </div>

                                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatDate(doc.updated_at)}</span>
                                                <span className="mx-1">•</span>
                                                <span>{doc.word_count?.toLocaleString() || 0} words</span>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-9 text-xs"
                                                >
                                                    Open
                                                    <ArrowUpRight className="ml-1 h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setDeleteConfirmDoc(doc);
                                                    }}
                                                    title="Delete Document"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )
            ) : (
                <Card className={cn(
                    "border-dashed",
                    isDark
                        ? "border-white/10 bg-white/5"
                        : "border-slate-200 bg-slate-50/50"
                )}>
                    <CardContent className="p-12 text-center">
                        <div className={cn(
                            "mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4",
                            isDark ? "bg-white/10 text-slate-400" : "bg-slate-100 text-slate-400"
                        )}>
                            {searchTerm ? <Search className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                        </div>
                        <h3 className={cn(
                            "text-lg font-semibold mb-2",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            {searchTerm ? 'No documents found' : 'No documents yet'}
                        </h3>
                        <p className={cn(
                            "text-sm mb-6 max-w-md mx-auto",
                            isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                            {searchTerm
                                ? 'Try adjusting your search terms or create a new document.'
                                : 'Get started by creating your first academic assignment upgrade.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            {searchTerm && (
                                <Button variant="outline" onClick={() => setSearchTerm('')}>
                                    Clear Search
                                </Button>
                            )}
                            <Button
                                onClick={() => setShowContentModal(true)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Create New Document
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}


            {/* Delete Confirmation Modal */}
            {deleteConfirmDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150",
                        isDark ? "bg-slate-800 border border-white/10" : "bg-white"
                    )}>
                        <div className="flex items-start gap-4 mb-6">
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                                isDark ? "bg-red-500/20" : "bg-red-100"
                            )}>
                                <Trash2 className={cn(
                                    "h-6 w-6",
                                    isDark ? "text-red-400" : "text-red-600"
                                )} />
                            </div>
                            <div>
                                <h3 className={cn(
                                    "text-lg font-bold",
                                    isDark ? "text-white" : "text-slate-900"
                                )}>
                                    Delete Permanently?
                                </h3>
                                <p className={cn(
                                    "text-sm mt-1",
                                    isDark ? "text-slate-400" : "text-slate-600"
                                )}>
                                    Are you sure you want to delete "{deleteConfirmDoc.title}"? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setDeleteConfirmDoc(null)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete Forever
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
