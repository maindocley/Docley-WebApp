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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { ContentIntakeModal } from '../../components/modals/ContentIntakeModal';
import { IntakeModal } from '../../components/modals/IntakeModal';
import { getDocuments, deleteDocument } from '../../services/documentsService';

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
    const { addToast } = useToast();

    // Load documents
    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await getDocuments();
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

    const handleDelete = async (e, docId, docTitle) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await deleteDocument(docId);
            addToast(`"${docTitle}" moved to trash`, 'success');
            loadDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            addToast('Failed to delete document', 'error');
        }
        setActiveMenu(null);
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

    const handleFilter = () => {
        addToast('Filter options coming soon!', 'info');
    };

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
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Documents</h1>
                        <p className="text-sm text-slate-600">
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
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents by title or content..."
                            className="w-full pl-10 pr-4 h-11 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-9 pr-4 h-11 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                            >
                                <option value="recent">Sort by Recent</option>
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                            </select>
                            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleFilter}
                            className="h-11 w-11 border-slate-200"
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-11">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 transition-colors ${viewMode === 'grid'
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 transition-colors border-l border-slate-200 ${viewMode === 'list'
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'bg-white text-slate-500 hover:bg-slate-50'
                                    }`}
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
                                                                    onClick={(e) => handleDelete(e, doc.id, doc.title)}
                                                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2 mb-4">
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                                                {doc.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                                {doc.content?.substring(0, 100) || 'No content yet...'}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDate(doc.updated_at)}
                                                </span>
                                                <span>•</span>
                                                <span>{doc.word_count?.toLocaleString() || 0} words</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                                                Open Document
                                            </span>
                                            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
                                                    onClick={(e) => handleDelete(e, doc.id, doc.title)}
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
                <Card className="border-slate-200 border-dashed bg-slate-50/50">
                    <CardContent className="p-12 text-center">
                        <div className="mx-auto h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            {searchTerm ? <Search className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {searchTerm ? 'No documents found' : 'No documents yet'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
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
        </div>
    );
}
