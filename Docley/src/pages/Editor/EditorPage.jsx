import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { Extension } from '@tiptap/core';

const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace('px', ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}px`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: fontSize => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

const LineHeight = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            defaultLineHeight: '1.5',
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: this.options.defaultLineHeight,
                        parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight) {
                                return {};
                            }
                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setLineHeight: lineHeight => ({ commands }) => {
                return this.options.types.every(type => commands.updateAttributes(type, { lineHeight }));
            },
            unsetLineHeight: () => ({ commands }) => {
                return this.options.types.every(type => commands.resetAttributes(type, 'lineHeight'));
            },
        };
    },
});

import { Button } from '../../components/ui/Button';
import {
    ArrowLeft,
    Save,
    Download,
    Wand2,
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Quote,
    Type,
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
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Palette,
    Highlighter,
    Type as FontIcon,
    ChevronDown,
    Eraser,
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

    const [showFontFamily, setShowFontFamily] = useState(false);
    const [showHeadings, setShowHeadings] = useState(false);
    const [showLineHeight, setShowLineHeight] = useState(false);

    const lineHeights = [
        { label: 'Single', value: '1.0' },
        { label: '1.15', value: '1.15' },
        { label: '1.5', value: '1.5' },
        { label: 'Double', value: '2.0' },
    ];

    const fonts = [
        { name: 'Default', value: '' },
        { name: 'Arial', value: 'Arial' },
        { name: 'Roboto', value: 'Roboto' },
        { name: 'Sans-Serif', value: 'sans-serif' },
        { name: 'Serif', value: 'serif' },
        { name: 'Monospace', value: 'monospace' },
    ];

    const fontSizes = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96];

    const currentFontSize = editor.getAttributes('textStyle').fontSize || '16';

    const updateFontSize = (newSize) => {
        if (newSize) {
            editor.chain().focus().setFontSize(newSize).run();
        }
    };

    const incrementFontSize = () => {
        const size = parseInt(currentFontSize);
        updateFontSize((size + 1).toString());
    };

    const decrementFontSize = () => {
        const size = parseInt(currentFontSize);
        if (size > 1) {
            updateFontSize((size - 1).toString());
        }
    };

    const headingLevels = [
        { label: 'Normal Text', level: 0 },
        { label: 'Heading 1', level: 1 },
        { label: 'Heading 2', level: 2 },
        { label: 'Heading 3', level: 3 },
    ];

    const addColor = (e) => {
        editor.chain().focus().setColor(e.target.value).run();
    };

    const addHighlight = (e) => {
        editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
    };

    return (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
            {/* History */}
            <div className="flex items-center">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Headings */}
            <div className="relative group">
                <button
                    onClick={() => setShowHeadings(!showHeadings)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 min-w-[100px]"
                >
                    {headingLevels.find(h => h.level === (editor.isActive('heading', { level: 1 }) ? 1 : editor.isActive('heading', { level: 2 }) ? 2 : editor.isActive('heading', { level: 3 }) ? 3 : 0))?.label || 'Normal Text'}
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showHeadings && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                        {headingLevels.map(h => (
                            <button
                                key={h.level}
                                onClick={() => {
                                    if (h.level === 0) editor.chain().focus().setParagraph().run();
                                    else editor.chain().focus().toggleHeading({ level: h.level }).run();
                                    setShowHeadings(false);
                                }}
                                className={cn(
                                    "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100",
                                    (h.level === 0 ? !editor.isActive('heading') : editor.isActive('heading', { level: h.level })) && "text-indigo-600 bg-indigo-50 font-medium"
                                )}
                            >
                                {h.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Font Family */}
            <div className="relative group">
                <button
                    onClick={() => setShowFontFamily(!showFontFamily)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 min-w-[100px]"
                >
                    <span className="truncate">{fonts.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.name || 'Arial'}</span>
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showFontFamily && (
                    <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                        {fonts.map(f => (
                            <button
                                key={f.name}
                                onClick={() => {
                                    editor.chain().focus().setFontFamily(f.value).run();
                                    setShowFontFamily(false);
                                }}
                                style={{ fontFamily: f.value }}
                                className={cn(
                                    "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100",
                                    editor.isActive('textStyle', { fontFamily: f.value }) && "text-indigo-600 bg-indigo-50 font-medium"
                                )}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Font Size */}
            <div className="flex items-center gap-1">
                <button
                    onClick={decrementFontSize}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                    title="Decrease font size"
                >
                    <span className="text-lg font-bold">-</span>
                </button>
                <div className="relative group">
                    <input
                        type="text"
                        value={currentFontSize}
                        onChange={(e) => updateFontSize(e.target.value)}
                        className="w-10 h-7 text-center text-sm border border-slate-200 rounded hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <button
                    onClick={incrementFontSize}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                    title="Increase font size"
                >
                    <span className="text-lg font-bold">+</span>
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive('bold') && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive('italic') && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive('underline') && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </button>

                {/* Text Color */}
                <div className="relative flex items-center p-1.5 rounded hover:bg-slate-200 text-slate-600 group cursor-pointer">
                    <Palette className="h-4 w-4" />
                    <input
                        type="color"
                        onInput={addColor}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Text Color"
                    />
                    <div className="absolute bottom-1 left-1.5 right-1.5 h-0.5" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
                </div>

                {/* Highlight Color */}
                <div className="relative flex items-center p-1.5 rounded hover:bg-slate-200 text-slate-600 group cursor-pointer">
                    <Highlighter className="h-4 w-4" />
                    <input
                        type="color"
                        onInput={addHighlight}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        title="Highlight Color"
                    />
                    <div className="absolute bottom-1 left-1.5 right-1.5 h-0.5" style={{ backgroundColor: editor.getAttributes('highlight').color || '#ffff00' }} />
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive({ textAlign: 'left' }) && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive({ textAlign: 'center' }) && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive({ textAlign: 'right' }) && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive({ textAlign: 'justify' }) && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Lists */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive('bulletList') && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600",
                        editor.isActive('orderedList') && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Line Spacing */}
            <div className="relative group">
                <button
                    onClick={() => setShowLineHeight(!showLineHeight)}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                    title="Line spacing"
                >
                    <div className="flex flex-col items-center leading-[0.5]">
                        <span className="text-[10px] font-bold">---</span>
                        <span className="text-[10px] font-bold">---</span>
                    </div>
                </button>
                {showLineHeight && (
                    <div className="absolute top-full left-0 mt-1 w-32 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                        {lineHeights.map(lh => (
                            <button
                                key={lh.value}
                                onClick={() => {
                                    editor.chain().focus().setLineHeight(lh.value).run();
                                    setShowLineHeight(false);
                                }}
                                className={cn(
                                    "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100",
                                    editor.getAttributes('paragraph').lineHeight === lh.value && "text-indigo-600 bg-indigo-50 font-medium"
                                )}
                            >
                                {lh.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Clear Formatting */}
            <button
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                title="Clear Formatting"
            >
                <Eraser className="h-4 w-4" />
            </button>
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
                Underline,
                TextStyle,
                Color,
                Highlight.configure({ multicolor: true }),
                FontFamily,
                TextAlign.configure({
                    types: ['heading', 'paragraph'],
                }),
                FontSize,
                LineHeight,
            ],
            content: doc?.content_html || doc?.content || '',
            editorProps: {
                attributes: {
                    class: 'prose prose-slate max-w-none focus:outline-none min-h-[1056px] px-[96px] py-[96px] text-[#3c4043] leading-[1.5] text-base relative outline-none border-none shadow-none',
                    style: `
                        background: linear-gradient(to bottom, #ffffff 1056px, #f1f5f9 1056px, #f1f5f9 1076px, #ffffff 1076px);
                        background-size: 100% 1076px;
                    `,
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
        []
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

            {/* Editor Canvas - Full Page / Google Docs Style */}
            <main className="flex-1 overflow-y-auto bg-slate-100 custom-scrollbar p-12">
                <div className="max-w-[816px] mx-auto shadow-xl bg-white min-h-[1056px]">
                    <div
                        className="cursor-text"
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
