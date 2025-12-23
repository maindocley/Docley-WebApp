import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';
import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';

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
    Layout,
    Image as ImageIcon,
} from 'lucide-react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';

import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import { DiagnosticReport } from '../../components/modals/DiagnosticReport';
import { EDITOR_CONFIG } from './editorConfig';
import { Pagination } from './extensions/Pagination';
import './Editor.css';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { exportToPDF, exportToWord } from './lib/exportUtils';
import { getDocument, updateDocument, autoSaveDocument, deleteDocument, permanentlyDeleteDocument } from '../../services/documentsService';
import { upgradeDocument } from '../../services/aiService';

// Memoized MenuBar component to prevent unnecessary re-renders
const MenuBar = memo(({ editor, zoom, setZoom, onImageUpload, imageInputRef }) => {
    const [showFontFamily, setShowFontFamily] = useState(false);
    const [showHeadings, setShowHeadings] = useState(false);
    const [showLineHeight, setShowLineHeight] = useState(false);
    const [showPageSetup, setShowPageSetup] = useState(false);
    const [showTextColor, setShowTextColor] = useState(false);
    const [showHighlightColor, setShowHighlightColor] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);

    // Memoize static data
    const lineHeights = useMemo(() => [
        { label: 'Single', value: '1.0' },
        { label: '1.15', value: '1.15' },
        { label: '1.5', value: '1.5' },
        { label: 'Double', value: '2.0' },
    ], []);

    const fonts = useMemo(() => [
        { name: 'Default', value: '' },
        { name: 'Arial', value: 'Arial' },
        { name: 'Roboto', value: 'Roboto' },
        { name: 'Sans-Serif', value: 'sans-serif' },
        { name: 'Serif', value: 'serif' },
        { name: 'Monospace', value: 'monospace' },
    ], []);

    const headingLevels = useMemo(() => [
        { label: 'Normal Text', level: 0 },
        { label: 'Heading 1', level: 1 },
        { label: 'Heading 2', level: 2 },
        { label: 'Heading 3', level: 3 },
    ], []);

    // Helper for Font Size Clamping
    const clampFontSize = (val) => {
        const size = parseInt(val);
        if (isNaN(size)) return 12;
        return Math.min(Math.max(size, 6), 32);
    };

    // Memoize current font size to avoid recalculation
    const currentFontSize = useMemo(() => {
        if (!editor) return '16';
        return editor.getAttributes('textStyle').fontSize || '16';
    }, [editor?.state.selection]);

    // Optimize formatting callbacks with useCallback
    const updateFontSize = useCallback((newSize) => {
        if (!editor || !newSize) return;
        const clamped = clampFontSize(newSize);
        editor.chain().focus().setFontSize(clamped.toString()).run();
    }, [editor]);

    const incrementFontSize = useCallback(() => {
        const size = parseInt(currentFontSize) || 16;
        updateFontSize((size + 1).toString());
    }, [currentFontSize, updateFontSize]);

    const decrementFontSize = useCallback(() => {
        const size = parseInt(currentFontSize) || 16;
        if (size > 1) {
            updateFontSize((size - 1).toString());
        }
    }, [currentFontSize, updateFontSize]);

    const addColor = useCallback((color) => {
        if (!editor) return;
        editor.chain().focus().setColor(color).run();
        setShowTextColor(false);
    }, [editor]);

    const addHighlight = useCallback((color) => {
        if (!editor) return;
        if (color === null) {
            editor.chain().focus().unsetHighlight().run();
        } else {
            editor.chain().focus().toggleHighlight({ color }).run();
        }
        setShowHighlightColor(false);
    }, [editor]);

    // Memoize formatting button handlers
    const handleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
    const handleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
    const handleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
    const handleUndo = useCallback(() => editor?.chain().focus().undo().run(), [editor]);
    const handleRedo = useCallback(() => editor?.chain().focus().redo().run(), [editor]);

    // Memoize heading handlers
    const handleHeading = useCallback((level) => {
        if (!editor) return;
        if (level === 0) {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().toggleHeading({ level }).run();
        }
        setShowHeadings(false);
    }, [editor]);

    // Memoize font family handler
    const handleFontFamily = useCallback((value) => {
        if (!editor) return;
        editor.chain().focus().setFontFamily(value).run();
        setShowFontFamily(false);
    }, [editor]);

    // Memoize line height handler
    const handleLineHeight = useCallback((value) => {
        if (!editor) return;
        editor.chain().focus().setLineHeight(value).run();
        setShowLineHeight(false);
    }, [editor]);

    const handleImageUrl = useCallback(() => {
        const url = window.prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        setShowImageOptions(false);
    }, [editor]);

    // Memoize alignment handlers
    const handleAlign = useCallback((align) => {
        if (!editor) return;
        editor.chain().focus().setTextAlign(align).run();
    }, [editor]);

    // Memoize list handlers
    const handleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
    const handleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);

    // Memoize clear formatting
    const handleClearFormatting = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetAllMarks().clearNodes().run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    // Get active states (memoized)
    const isBold = editor.isActive('bold');
    const isItalic = editor.isActive('italic');
    const isUnderline = editor.isActive('underline');
    const canUndo = editor.can().undo();
    const canRedo = editor.can().redo();
    const activeHeading = editor.isActive('heading', { level: 1 }) ? 1 :
        editor.isActive('heading', { level: 2 }) ? 2 :
            editor.isActive('heading', { level: 3 }) ? 3 : 0;
    const activeFontFamily = fonts.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.value || '';
    const activeLineHeight = editor.getAttributes('paragraph').lineHeight || '1.5';
    const textAlign = editor.getAttributes('textAlign') || 'left';

    return (
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
            {/* History */}
            <div className="flex items-center">
                <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30 transition-colors"
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
                    className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 min-w-[100px] transition-colors"
                >
                    {headingLevels.find(h => h.level === activeHeading)?.label || 'Normal Text'}
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showHeadings && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowHeadings(false)} />
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            {headingLevels.map(h => (
                                <button
                                    key={h.level}
                                    onClick={() => handleHeading(h.level)}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors",
                                        activeHeading === h.level && "text-indigo-600 bg-indigo-50 font-medium"
                                    )}
                                >
                                    {h.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Font Family */}
            <div className="relative group">
                <button
                    onClick={() => setShowFontFamily(!showFontFamily)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 min-w-[100px] transition-colors"
                >
                    <span className="truncate">{fonts.find(f => f.value === activeFontFamily)?.name || 'Arial'}</span>
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showFontFamily && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowFontFamily(false)} />
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            {fonts.map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => handleFontFamily(f.value)}
                                    style={{ fontFamily: f.value }}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors",
                                        activeFontFamily === f.value && "text-indigo-600 bg-indigo-50 font-medium"
                                    )}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Font Size */}
            <div className="flex items-center gap-1">
                <button
                    onClick={decrementFontSize}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Decrease font size"
                >
                    <span className="text-lg font-bold">-</span>
                </button>
                <input
                    type="text"
                    value={currentFontSize}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value) updateFontSize(value);
                    }}
                    className="w-10 h-7 text-center text-sm border border-slate-200 rounded hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                    onClick={incrementFontSize}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Increase font size"
                >
                    <span className="text-lg font-bold">+</span>
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Basic Formatting */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={handleBold}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        isBold && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={handleItalic}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        isItalic && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    onClick={handleUnderline}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        isUnderline && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Underline (Ctrl+U)"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </button>

                {/* Text Color */}
                <div className="relative group">
                    <button
                        onClick={() => setShowTextColor(!showTextColor)}
                        className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Text Color"
                    >
                        <div className="flex flex-col items-center">
                            <span className="font-serif font-bold text-sm leading-none">A</span>
                            <div className="h-1 w-4 mt-0.5" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
                        </div>
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                    </button>
                    {showTextColor && (
                        <>
                            <div className="fixed inset-0 z-39" onClick={() => setShowTextColor(false)} />
                            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                                <ColorPicker
                                    value={editor.getAttributes('textStyle').color || '#000000'}
                                    onChange={addColor}
                                    onClose={() => setShowTextColor(false)}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Highlight Color */}
                <div className="relative group">
                    <button
                        onClick={() => setShowHighlightColor(!showHighlightColor)}
                        className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Highlight Color"
                    >
                        <div className="flex flex-col items-center">
                            <Highlighter className="h-3.5 w-3.5" />
                            <div className="h-1 w-4 mt-0.5" style={{ backgroundColor: editor.getAttributes('highlight').color || 'transparent' }} />
                        </div>
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                    </button>
                    {showHighlightColor && (
                        <>
                            <div className="fixed inset-0 z-39" onClick={() => setShowHighlightColor(false)} />
                            <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                                <ColorPicker
                                    type="highlight"
                                    value={editor.getAttributes('highlight').color}
                                    onChange={addHighlight}
                                    onClose={() => setShowHighlightColor(false)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Alignment */}
            <div className="flex items-center gap-0.5">
                <button
                    onClick={() => handleAlign('left')}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        textAlign === 'left' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </button>
                <button
                    onClick={() => handleAlign('center')}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        textAlign === 'center' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </button>
                <button
                    onClick={() => handleAlign('right')}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        textAlign === 'right' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </button>
                <button
                    onClick={() => handleAlign('justify')}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        textAlign === 'justify' && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
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
                    onClick={handleBulletList}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
                        editor.isActive('bulletList') && "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    )}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onClick={handleOrderedList}
                    className={cn(
                        "p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors",
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
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Line spacing"
                >
                    <div className="flex flex-col items-center leading-[0.5]">
                        <span className="text-[10px] font-bold">---</span>
                        <span className="text-[10px] font-bold">---</span>
                    </div>
                </button>
                {showLineHeight && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowLineHeight(false)} />
                        <div className="absolute top-full left-0 mt-1 w-32 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            {lineHeights.map(lh => (
                                <button
                                    key={lh.value}
                                    onClick={() => handleLineHeight(lh.value)}
                                    className={cn(
                                        "w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors",
                                        activeLineHeight === lh.value && "text-indigo-600 bg-indigo-50 font-medium"
                                    )}
                                >
                                    {lh.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Add Image */}
            <div className="relative group">
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                />
                <button
                    onClick={() => setShowImageOptions(!showImageOptions)}
                    className="flex items-center gap-1 p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Insert Image"
                >
                    <ImageIcon className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showImageOptions && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowImageOptions(false)} />
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white shadow-lg border border-slate-200 rounded-md py-1 z-40">
                            <button
                                onClick={() => {
                                    imageInputRef.current?.click();
                                    setShowImageOptions(false);
                                }}
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors"
                            >
                                Upload from Computer
                            </button>
                            <button
                                onClick={handleImageUrl}
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 transition-colors"
                            >
                                By URL
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Clear Formatting */}
            <button
                onClick={handleClearFormatting}
                className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                title="Clear Formatting"
            >
                <Eraser className="h-4 w-4" />
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 ml-auto border-l border-slate-200 pl-2">
                <button
                    onClick={() => {
                        const currentIndex = EDITOR_CONFIG.ZOOM_LEVELS.findIndex(z => z.value === zoom);
                        if (currentIndex > 0) setZoom(EDITOR_CONFIG.ZOOM_LEVELS[currentIndex - 1].value);
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Zoom Out"
                >
                    <span className="text-lg font-bold">-</span>
                </button>
                <select
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="appearance-none bg-transparent hover:bg-slate-200 px-2 py-1 rounded text-sm font-medium text-slate-600 focus:outline-none cursor-pointer transition-colors"
                >
                    {EDITOR_CONFIG.ZOOM_LEVELS.map(z => (
                        <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => {
                        const currentIndex = EDITOR_CONFIG.ZOOM_LEVELS.findIndex(z => z.value === zoom);
                        if (currentIndex < EDITOR_CONFIG.ZOOM_LEVELS.length - 1) setZoom(EDITOR_CONFIG.ZOOM_LEVELS[currentIndex + 1].value);
                    }}
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Zoom In"
                >
                    <span className="text-lg font-bold">+</span>
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Page Setup */}
            <div className="relative group">
                <button
                    onClick={() => setShowPageSetup(!showPageSetup)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-200 text-sm text-slate-700 transition-colors"
                    title="Page Setup"
                >
                    <Layout className="h-4 w-4 text-slate-600" />
                    <span>Page Setup</span>
                    <ChevronDown className="h-3 w-3" />
                </button>
                {showPageSetup && (
                    <>
                        <div className="fixed inset-0 z-39" onClick={() => setShowPageSetup(false)} />
                        <div className="absolute top-full right-0 mt-1 w-56 bg-white shadow-xl border border-slate-200 rounded-md py-2 z-40 animate-in fade-in slide-in-from-top-1">
                            <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase">Page Numbers</div>
                            <button
                                onClick={() => {
                                    editor.setOptions({
                                        pagination: { showPageNumbers: true, pageNumberPosition: 'footer-right' }
                                    });
                                    setShowPageSetup(false);
                                }}
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between transition-colors"
                            >
                                <span>Bottom Right</span>
                                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            </button>
                            <button
                                onClick={() => {
                                    editor.setOptions({
                                        pagination: { showPageNumbers: true, pageNumberPosition: 'footer-center' }
                                    });
                                    setShowPageSetup(false);
                                }}
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 transition-colors"
                            >
                                Bottom Center
                            </button>
                            <button
                                onClick={() => {
                                    editor.setOptions({
                                        pagination: { showPageNumbers: true, pageNumberPosition: 'header-right' }
                                    });
                                    setShowPageSetup(false);
                                }}
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 transition-colors"
                            >
                                Top Right
                            </button>
                            <div className="h-px bg-slate-100 my-1" />
                            <button
                                onClick={() => {
                                    editor.setOptions({
                                        pagination: { showPageNumbers: false }
                                    });
                                    setShowPageSetup(false);
                                }}
                                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                Disable Page Numbers
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

MenuBar.displayName = 'MenuBar';

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
    const [zoom, setZoom] = useState(1.0);
    const [showReport, setShowReport] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { addToast } = useToast();
    const autoSaveTimeoutRef = useRef(null);
    const editorRef = useRef(null);
    const imageInputRef = useRef(null);

    // Load document
    useEffect(() => {
        const loadDocument = async () => {
            if (id === 'new') {
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

    // Optimized auto-save with debouncing
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

    // Optimized editor configuration
    const editorExtensions = useMemo(() => [
        StarterKit.configure({
            history: true,
        }),
        Placeholder.configure({
            placeholder: 'Start writing or paste your assignment here...',
        }),
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        FontFamily,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Image.configure({
            inline: false,
            allowBase64: true,
            HTMLAttributes: {
                class: 'editor-image',
            },
        }),
        FontSize,
        LineHeight,
        Pagination.configure({
            pageWidth: EDITOR_CONFIG.PAGE_WIDTH,
            pageHeight: EDITOR_CONFIG.PAGE_HEIGHT,
            margins: EDITOR_CONFIG.DEFAULT_MARGINS,
        }),
    ], []);

    const editor = useEditor(
        {
            extensions: editorExtensions,
            content: doc?.content_html || doc?.content || '',
            editorProps: {
                attributes: {
                    class: 'focus:outline-none relative outline-none border-none shadow-none',
                },
            },
            onUpdate: ({ editor }) => {
                // Debounced auto-save - increased delay for better performance
                if (autoSaveTimeoutRef.current) {
                    clearTimeout(autoSaveTimeoutRef.current);
                }
                autoSaveTimeoutRef.current = setTimeout(() => {
                    const text = editor.getText();
                    const html = editor.getHTML();
                    handleAutoSave(text, html);
                }, 3000); // Increased to 3 seconds for better performance
            },
        },
        [doc?.content_html, doc?.content, handleAutoSave]
    );

    // Handle image upload
    const handleImageSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addToast('Please select an image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            addToast('Image size must be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const src = event.target.result;
            if (editor) {
                editor.chain().focus().setImage({ src }).run();
                addToast('Image added successfully', 'success');
            }
        };
        reader.onerror = () => {
            addToast('Failed to load image', 'error');
        };
        reader.readAsDataURL(file);

        // Reset input
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    }, [editor, addToast]);

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

    const handleTitleChange = useCallback(async (newTitle) => {
        setDoc(prev => ({ ...prev, title: newTitle }));
        if (id !== 'new' && doc?.id) {
            try {
                await updateDocument(doc.id, { title: newTitle });
            } catch (error) {
                console.error('Failed to update title:', error);
            }
        }
    }, [id, doc?.id]);

    const handleUpgrade = useCallback(async () => {
        if (!editor) return;

        setIsUpgrading(true);
        addToast('Starting context expansion and academic analysis...', 'info');

        try {
            const currentContent = editor.getText();
            // If content is too short, warn user? Or just proceed.
            if (currentContent.trim().length < 10) {
                addToast('Document is too short to upgrade.', 'error');
                setIsUpgrading(false);
                return;
            }

            const upgradedText = await upgradeDocument(currentContent);

            if (upgradedText) {
                editor.commands.setContent(upgradedText);
                addToast('Upgrade complete! Content expanded and improved.', 'success');
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            addToast('Failed to upgrade document: ' + error.message, 'error');
        } finally {
            setIsUpgrading(false);
        }
    }, [editor, addToast]);

    const handleExport = useCallback(async (format) => {
        setIsExporting(true);
        addToast(`Preparing ${format} export...`, 'info');

        try {
            const fileName = `${doc?.title || 'Document'}.${format === 'PDF' ? 'pdf' : 'docx'}`;

            if (format === 'PDF') {
                // Wait for editor to be ready
                await new Promise(resolve => setTimeout(resolve, 100));
                const editorElement = document.querySelector('.ProseMirror');
                if (!editorElement) {
                    throw new Error('Editor element not found');
                }
                await exportToPDF(editorElement, fileName);
            } else if (format === 'Word') {
                if (!editor) throw new Error('Editor not initialized');
                const html = editor.getHTML();
                await exportToWord(html, fileName, {
                    title: doc?.title,
                    description: `Academic ${doc?.document_type || 'Document'} created with Docley`
                });
            }

            addToast(`${format} exported successfully`, 'success');
        } catch (error) {
            console.error('Export failed:', error);
            addToast(`Failed to export ${format}: ${error.message}`, 'error');
        } finally {
            setIsExporting(false);
            setShowSettings(false);
        }
    }, [doc, editor, addToast]);

    const handleDelete = useCallback(async () => {
        if (id === 'new') {
            setShowDeleteConfirm(false);
            setShowSettings(false);
            addToast('Draft discarded', 'info');
            navigate('/dashboard/documents');
            return;
        }

        if (!doc?.id) return;

        try {
            await permanentlyDeleteDocument(doc.id);
            addToast('Document deleted permanently', 'success');
            navigate('/dashboard/documents');
        } catch (error) {
            console.error('Failed to delete:', error);
            addToast('Failed to delete document', 'error');
        } finally {
            setShowDeleteConfirm(false);
            setShowSettings(false);
        }
    }, [doc?.id, id, navigate, addToast]);

    const formatLastSaved = useCallback(() => {
        if (!lastSaved) return null;
        const now = new Date();
        const diffMs = now - lastSaved;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Saved just now';
        if (diffMins === 1) return 'Saved 1 minute ago';
        if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
        return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }, [lastSaved]);

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
            <DiagnosticReport
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                documentText={editor?.getText() || ''}
            />

            {/* Top Navigation Bar */}
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
                                            <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
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
                                                disabled={isExporting}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 disabled:opacity-50 transition-colors"
                                            >
                                                <Download className="h-4 w-4 text-slate-400" />
                                                Export as PDF
                                            </button>
                                            <button
                                                onClick={() => handleExport('Word')}
                                                disabled={isExporting}
                                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 disabled:opacity-50 transition-colors"
                                            >
                                                <Download className="h-4 w-4 text-slate-400" />
                                                Export as Word
                                            </button>
                                        </div>
                                        <div className="py-1 border-t border-slate-100">
                                            <button
                                                onClick={() => setShowDeleteConfirm(true)}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
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
                <MenuBar editor={editor} zoom={zoom} setZoom={setZoom} onImageUpload={handleImageSelect} imageInputRef={imageInputRef} />
            </header>

            {/* Editor Canvas */}
            <main className="flex-1 overflow-auto bg-[#cbd5e1] custom-scrollbar p-12">
                <div
                    className="editor-canvas"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center'
                    }}
                >
                    <div
                        className="cursor-text"
                        onClick={() => editor?.chain().focus().run()}
                        ref={editorRef}
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
                                <h3 className="text-lg font-bold text-slate-900">Delete Permanently?</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    Are you sure you want to delete "{doc?.title}"? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
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
