import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../../components/ui/Button';
import {
    ArrowLeft,
    Save,
    Download,
    Wand2,
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Loader2,
    CheckCircle,
    MoreHorizontal,
    FileText,
    BarChart3,
    Sparkles,
    Settings,
    Trash2,
    Clock,
} from 'lucide-react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { DiagnosticReport } from '../../components/modals/DiagnosticReport';
import { getDocument, updateDocument, autoSaveDocument, deleteDocument } from '../../services/documentsService';

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }

    const buttons = [
        { icon: Undo, action: () => editor.chain().focus().undo().run(), disabled: !editor.can().undo(), label: 'Undo' },
        { icon: Redo, action: () => editor.chain().focus().redo().run(), disabled: !editor.can().redo(), label: 'Redo' },
        { type: 'divider' },
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold'), label: 'Bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic'), label: 'Italic' },
        { type: 'divider' },
        { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }), label: 'Heading 1' },
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }), label: 'Heading 2' },
        { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }), label: 'Heading 3' },
        { type: 'divider' },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList'), label: 'Bullet List' },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList'), label: 'Numbered List' },
        { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote'), label: 'Quote' },
    ];

    return (
        <div className="flex flex-wrap items-center gap-0.5 px-4 py-2 bg-white border-b border-slate-200">
            {buttons.map((btn, index) => (
                btn.type === 'divider' ? (
                    <div key={index} className="w-px h-6 bg-slate-200 mx-2" />
                ) : (
                    <button
                        key={index}
                        onClick={btn.action}
                        disabled={btn.disabled}
                        title={btn.label}
                        className={cn(
                            'p-2 rounded-md hover:bg-slate-100 text-slate-600 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
                            btn.isActive && 'bg-indigo-100 text-indigo-700'
                        )}
                    >
                        <btn.icon className="h-4 w-4" />
                    </button>
                )
            ))}
        </div>
    );
};

export default function EditorPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { addToast } = useToast();
    const autoSaveTimeoutRef = useRef(null);

    // Load document
    useEffect(() => {
        const loadDocument = async () => {
            if (id === 'new') {
                // Handle new document from navigation state
                const initialState = location.state || {};
                setDoc({
                    id: 'new',
                    title: initialState.title || 'Untitled Document',
                    content: initialState.content || '',
                    content_html: initialState.contentHtml || '',
                    academic_level: initialState.level || 'undergraduate',
                    citation_style: initialState.style || 'APA 7th Edition',
                    document_type: initialState.type || 'Essay',
                    status: 'draft',
                    word_count: 0,
                });
                setIsLoading(false);
                return;
            }

            try {
                const document = await getDocument(id);
                setDoc(document);
                setLastSaved(new Date(document.updated_at));
            } catch (error) {
                console.error('Error loading document:', error);
                addToast('Failed to load document', 'error');
                navigate('/dashboard/documents');
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [id, location.state, navigate, addToast]);

    // Auto-save function
    const handleAutoSave = useCallback(async (content, html) => {
        if (id === 'new' || !doc?.id) return;

        setIsSaving(true);
        try {
            const result = await autoSaveDocument(doc.id, content, html);
            setLastSaved(new Date(result.updated_at));
            setDoc(prev => ({ ...prev, word_count: result.word_count }));
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    }, [id, doc?.id]);

    const editor = useEditor(
        {
            extensions: [
                StarterKit,
                Placeholder.configure({
                    placeholder: 'Start writing or paste your assignment here...',
                }),
            ],
            content: doc?.content_html || doc?.content || '',
            editorProps: {
                attributes: {
                    class: 'prose prose-slate max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-16 py-12 text-base leading-relaxed',
                },
            },
            onUpdate: ({ editor }) => {
                // Debounced auto-save
                if (autoSaveTimeoutRef.current) {
                    clearTimeout(autoSaveTimeoutRef.current);
                }
                autoSaveTimeoutRef.current = setTimeout(() => {
                    const text = editor.getText();
                    const html = editor.getHTML();
                    handleAutoSave(text, html);
                }, 2000);
            },
        },
        [doc]
    );

    // Update content when doc loads
    useEffect(() => {
        if (editor && doc) {
            const content = doc.content_html || doc.content || '';
            if (editor.isEmpty && content) {
                editor.commands.setContent(content);
            }
        }
    }, [doc, editor]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, []);

    const handleTitleChange = async (newTitle) => {
        setDoc(prev => ({ ...prev, title: newTitle }));
        if (id !== 'new' && doc?.id) {
            try {
                await updateDocument(doc.id, { title: newTitle });
            } catch (error) {
                console.error('Failed to update title:', error);
            }
        }
    };

    const handleUpgrade = () => {
        setIsUpgrading(true);
        addToast('Starting academic analysis...', 'info');

        // Simulate API call
        setTimeout(() => {
            setIsUpgrading(false);
            addToast('Upgrade complete! Improvements applied.', 'success');
        }, 2500);
    };

    const handleExport = (format) => {
        addToast(`Exporting as ${format}...`, 'info');
        setTimeout(() => {
            addToast('Download started', 'success');
            setIsExporting(false);
        }, 1000);
    };

    const handleDelete = async () => {
        if (!doc?.id || id === 'new') return;

        try {
            await deleteDocument(doc.id);
            addToast('Document deleted', 'success');
            navigate('/dashboard/documents');
        } catch (error) {
            console.error('Failed to delete:', error);
            addToast('Failed to delete document', 'error');
        }
    };

    const formatLastSaved = () => {
        if (!lastSaved) return null;
        const now = new Date();
        const diffMs = now - lastSaved;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Saved just now';
        if (diffMins === 1) return 'Saved 1 minute ago';
        if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
        return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-600">Loading document...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-100 flex flex-col">
            <DiagnosticReport isOpen={showReport} onClose={() => setShowReport(false)} />

            {/* Top Navigation Bar - Google Docs Style */}
            <header className="bg-white border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center justify-between px-4 py-2">
                    {/* Left: Back + Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Link
                            to="/dashboard/documents"
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-slate-100 flex-shrink-0"
                            title="Back to Documents"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <input
                                    type="text"
                                    value={doc?.title || ''}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="text-lg font-semibold text-slate-900 bg-transparent border-none focus:outline-none focus:bg-slate-100 focus:px-2 focus:rounded w-full truncate hover:bg-slate-50 px-1 py-0.5 -ml-1 transition-colors"
                                    placeholder="Untitled Document"
                                />
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    {isSaving ? (
                                        <span className="flex items-center gap-1">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Saving...
                                        </span>
                                    ) : lastSaved ? (
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            {formatLastSaved()}
                                        </span>
                                    ) : null}
                                    <span className="text-slate-300">•</span>
                                    <span>{doc?.word_count?.toLocaleString() || 0} words</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReport(true)}
                            className="text-slate-600 hover:text-indigo-600"
                        >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Diagnostics
                        </Button>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                            onClick={handleUpgrade}
                            disabled={isUpgrading}
                        >
                            {isUpgrading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Upgrading...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Upgrade
                                </>
                            )}
                        </Button>

                        {/* More Menu */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSettings(!showSettings)}
                                className="text-slate-500 hover:text-slate-700 px-2"
                            >
                                <MoreHorizontal className="h-5 w-5" />
                            </Button>

                            {showSettings && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Settings</p>
                                        </div>
                                        <div className="py-1">
                                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                                                <Settings className="h-4 w-4 text-slate-400" />
                                                Document Settings
                                            </button>
                                        </div>
                                        <div className="px-4 py-2 border-t border-slate-100">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Export</p>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={() => handleExport('PDF')}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                            >
                                                <Download className="h-4 w-4 text-slate-400" />
                                                Export as PDF
                                            </button>
                                            <button
                                                onClick={() => handleExport('Word')}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                                            >
                                                <Download className="h-4 w-4 text-slate-400" />
                                                Export as Word
                                            </button>
                                        </div>
                                        <div className="py-1 border-t border-slate-100">
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete Document
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <MenuBar editor={editor} />
            </header>

            {/* Editor Canvas - Full Page */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto my-8">
                    <div
                        className="bg-white shadow-lg rounded-lg min-h-[calc(100vh-180px)] cursor-text"
                        onClick={() => editor?.chain().focus().run()}
                    >
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Delete Document?</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    This will move "{doc?.title}" to trash. You can restore it later from settings.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    handleDelete();
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
