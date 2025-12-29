import { useState, useRef } from 'react';
import { X, Upload, FileText, ClipboardPaste, ChevronRight, File, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker for pdfjs - use local worker URL from Vite
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export function ContentIntakeModal({ isOpen, onClose, onContinue }) {
    const [activeTab, setActiveTab] = useState('paste'); // 'paste' or 'upload'
    const [content, setContent] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };

    const handleFileSelect = async (selectedFile) => {
        setError('');
        setIsLoading(true);

        if (!selectedFile) {
            setIsLoading(false);
            return;
        }

        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!validTypes.includes(selectedFile.type)) {
            setError('Please upload a PDF, DOCX, or TXT file');
            setIsLoading(false);
            return;
        }

        if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
            setError('File size must be less than 20MB');
            setIsLoading(false);
            return;
        }

        setFile(selectedFile);

        try {
            if (selectedFile.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target.result;
                    setContent(text);
                    setHtmlContent(text.split('\n').map(line => `<p>${line}</p>`).join(''));
                    setIsLoading(false);
                };
                reader.readAsText(selectedFile);
            } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const arrayBuffer = await selectedFile.arrayBuffer();

                // Style mapping for better formatting preservation
                const styleMap = [
                    "p[style-name='Heading 1'] => h1:fresh",
                    "p[style-name='Heading 2'] => h2:fresh",
                    "p[style-name='Heading 3'] => h3:fresh",
                    "p[style-name='Title'] => h1:fresh",
                    "p[style-name='Subtitle'] => h2:fresh",
                    "r[style-name='Strong'] => strong",
                    "r[style-name='Emphasis'] => em",
                ];

                // Convert DOCX to HTML with images preserved as data URLs
                const result = await mammoth.convertToHtml({
                    arrayBuffer,
                    styleMap,
                    convertImage: mammoth.images.imgElement((image) => {
                        // Convert images to inline base64 data URLs
                        return image.read('base64').then((imageBuffer) => {
                            return {
                                src: `data:${image.contentType};base64,${imageBuffer}`
                            };
                        });
                    })
                });

                console.log('DOCX converted. HTML length:', result.value.length);
                if (result.messages.length > 0) {
                    console.log('Mammoth messages:', result.messages);
                }

                // Pass HTML to editor (preserves bold, lists, images)
                setHtmlContent(result.value);

                // Extract plain text for word count preview
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result.value;
                setContent(tempDiv.textContent || tempDiv.innerText || selectedFile.name);
                setIsLoading(false);
            } else if (selectedFile.type === 'application/pdf') {
                try {
                    // Set worker to local Vite URL
                    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
                    console.log('PDF.js worker configured locally:', pdfjs.GlobalWorkerOptions.workerSrc);

                    const arrayBuffer = await selectedFile.arrayBuffer();

                    // Load the PDF document
                    const loadingTask = pdfjs.getDocument({
                        data: arrayBuffer,
                        verbosity: 0,
                    });

                    const pdf = await loadingTask.promise;
                    console.log(`PDF loaded successfully: ${pdf.numPages} pages`);

                    if (!pdf || pdf.numPages === 0) {
                        throw new Error('PDF appears to be empty or corrupted');
                    }

                    const maxPages = Math.min(pdf.numPages, 50);

                    // Create array of page promises
                    const pagePromises = [];
                    for (let i = 1; i <= maxPages; i++) {
                        pagePromises.push(pdf.getPage(i));
                    }

                    // Await all pages using Promise.all
                    const pages = await Promise.all(pagePromises);
                    console.log(`Loaded ${pages.length} pages`);

                    // Get text content from all pages using Promise.all
                    const textContentPromises = pages.map(page => page.getTextContent());
                    const textContents = await Promise.all(textContentPromises);
                    console.log(`Extracted text content from ${textContents.length} pages`);

                    // Process each page's text content
                    const htmlParts = [];
                    const allText = [];

                    textContents.forEach((textContent, pageIndex) => {
                        if (!textContent || !textContent.items || textContent.items.length === 0) {
                            console.log(`Page ${pageIndex + 1}: No text items found`);
                            return;
                        }

                        let pageHtml = '';
                        let pageText = '';
                        let lastY = null;

                        // Process each text item
                        textContent.items.forEach((item) => {
                            if (!item.str) return;

                            const text = item.str;
                            const y = item.transform ? item.transform[5] : null;

                            // Check Y-coordinate for line breaks
                            if (lastY !== null && y !== null) {
                                const yDiff = Math.abs(y - lastY);
                                if (yDiff > 3) {
                                    // Y changed - insert line break
                                    pageHtml += '<br />';
                                    pageText += '\n';
                                }
                            }

                            // Add space between words if needed
                            if (pageHtml && !pageHtml.endsWith(' ') && !pageHtml.endsWith('>') && !text.startsWith(' ')) {
                                pageHtml += ' ';
                                pageText += ' ';
                            }

                            pageHtml += text;
                            pageText += text;

                            if (y !== null) {
                                lastY = y;
                            }
                        });

                        // Wrap page content in paragraph tags
                        if (pageHtml.trim()) {
                            htmlParts.push(`<p>${pageHtml.trim()}</p>`);
                            allText.push(pageText.trim());
                        }

                        // Add page separator
                        if (pageIndex < textContents.length - 1) {
                            htmlParts.push('<hr style="border:none; border-top:1px dashed #ccc; margin:1rem 0;" />');
                        }
                    });

                    const fullText = allText.join('\n\n');
                    const htmlResult = htmlParts.join('');

                    console.log(`Final extraction: ${fullText.length} chars, ${htmlParts.length} elements`);

                    if (!fullText.trim()) {
                        throw new Error('Could not extract text from PDF. The PDF might be image-based (scanned) or password-protected.');
                    }

                    setContent(fullText);
                    setHtmlContent(htmlResult);
                    setIsLoading(false);
                } catch (pdfError) {
                    console.error('PDF parsing error:', pdfError);
                    setError(`Failed to parse PDF: ${pdfError.message || 'The file might be corrupted, password-protected, or image-based. Please try pasting the text manually.'}`);
                    setIsLoading(false);
                    setFile(null);
                }
            }
        } catch (err) {
            console.error('File parsing error:', err);
            setError('Failed to parse file. It might be corrupted or protected.');
            setIsLoading(false);
        }
    };

    const handleContinue = async () => {
        if (activeTab === 'paste' && !content.trim()) {
            setError('Please paste some content to continue');
            return;
        }
        if (activeTab === 'upload' && !file) {
            setError('Please upload a file to continue');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            let fileContent = null;

            if (activeTab === 'upload' && file) {
                // Read file as Base64 (DataURL) to store in database
                fileContent = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            onContinue({
                content: activeTab === 'paste' ? content : content,
                contentHtml: activeTab === 'paste'
                    ? `<div style="font-size: 12pt;">${content.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('')}</div>`
                    : `<div style="font-size: 12pt;">${htmlContent}</div>`,
                file: activeTab === 'upload' ? file : null,
                fileContent,
                inputType: activeTab,
            });
        } catch (err) {
            console.error('Upload/Process error:', err);
            setError(err.message || 'Failed to process content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setContent('');
        setFile(null);
        setError('');
        setActiveTab('paste');
        onClose();
    };

    const removeFile = () => {
        setFile(null);
        setContent('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white to-orange-50/30 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Add Your Content</h2>
                            <p className="text-xs text-slate-500">Upload a file or paste your existing work</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tab Buttons */}
                <div className="flex border-b border-slate-200 bg-slate-50/50">
                    <button
                        onClick={() => { setActiveTab('paste'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'paste'
                            ? 'text-orange-600 border-orange-600 bg-white'
                            : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <ClipboardPaste className="h-4 w-4" />
                        Paste Text
                    </button>
                    <button
                        onClick={() => { setActiveTab('upload'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all border-b-2 ${activeTab === 'upload'
                            ? 'text-orange-600 border-orange-600 bg-white'
                            : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        <Upload className="h-4 w-4" />
                        Upload File
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {activeTab === 'paste' ? (
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <ClipboardPaste className="h-4 w-4 text-orange-600" />
                                Paste your draft below
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste your assignment, essay, or research paper here...

You can paste directly from Word, Google Docs, or any other text editor. We'll preserve your formatting as much as possible."
                                className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500">
                                {content.trim().split(/\s+/).filter(Boolean).length} words
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!file ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragging
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.docx,.txt"
                                        onChange={(e) => handleFileSelect(e.target.files[0])}
                                        className="hidden"
                                    />
                                    <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                                        <Upload className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                        Drop your file here
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">
                                        or click to browse from your computer
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Supports PDF, DOCX, and TXT files up to 20MB
                                    </p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                                <File className="h-6 w-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{file.name}</p>
                                                <p className="text-xs text-slate-500">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                                <CheckCircle className="h-4 w-4" />
                                                Ready
                                            </div>
                                            <button
                                                onClick={removeFile}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="px-6 pb-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                        <p className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-900">Next step: </span>
                            You'll set your document title, academic level, and citation style before entering the editor.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                    <Button variant="ghost" onClick={handleClose} className="text-slate-600 hover:text-slate-900">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleContinue}
                        disabled={(activeTab === 'paste' && !content.trim()) || (activeTab === 'upload' && !file) || isLoading}
                        isLoading={isLoading}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
                    >
                        {isLoading ? 'Processing...' : 'Continue'}
                        {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
