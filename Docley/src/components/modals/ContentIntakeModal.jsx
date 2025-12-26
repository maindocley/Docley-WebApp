import { useState, useRef } from 'react';
import { X, Upload, FileText, ClipboardPaste, ChevronRight, File, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Set worker for pdfjs - use unpkg CDN (more reliable than cdnjs)
// unpkg serves files directly from npm packages and is generally more reliable
if (typeof window !== 'undefined') {
    const workerVersion = pdfjs.version;
    // Use unpkg CDN - more reliable than cdnjs
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`;
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
                // Convert DOCX to HTML with images preserved
                const result = await mammoth.convertToHtml({
                    arrayBuffer,
                    convertImage: mammoth.images.imgElement((image) => {
                        // Convert images to base64 data URLs
                        return image.read('base64').then((imageBuffer) => {
                            return {
                                src: `data:${image.contentType};base64,${imageBuffer}`
                            };
                        });
                    })
                });

                // Preserve the HTML structure from mammoth
                setHtmlContent(result.value);
                // Extract plain text for content preview
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = result.value;
                setContent(tempDiv.textContent || tempDiv.innerText || selectedFile.name);
                setIsLoading(false);
            } else if (selectedFile.type === 'application/pdf') {
                try {
                    // Verify worker is configured
                    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                        // Fallback worker configuration
                        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
                    }

                    const arrayBuffer = await selectedFile.arrayBuffer();

                    // Configure PDF.js with better error handling
                    const loadingTask = pdfjs.getDocument({
                        data: arrayBuffer,
                        verbosity: 0, // Reduce console noise
                        // Remove cMapUrl to avoid additional CDN dependencies
                        // cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
                        // cMapPacked: true,
                    });

                    const pdf = await loadingTask.promise;

                    if (!pdf || pdf.numPages === 0) {
                        throw new Error('PDF appears to be empty or corrupted');
                    }

                    let htmlContent = '';
                    let fullText = '';
                    const maxPages = Math.min(pdf.numPages, 50); // Limit to 50 pages for performance

                    for (let i = 1; i <= maxPages; i++) {
                        try {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();

                            if (textContent && textContent.items && textContent.items.length > 0) {
                                let pageText = '';
                                let lastY = -1;

                                // Sort items by Y then X to ensure reading order
                                const items = textContent.items.sort((a, b) => {
                                    if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
                                        return b.transform[5] - a.transform[5]; // Top to bottom
                                    }
                                    return a.transform[4] - b.transform[4]; // Left to right
                                });

                                items.forEach((item) => {
                                    if ('str' in item) {
                                        const text = item.str;
                                        const currentY = item.transform[5];

                                        // Detect new line
                                        if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
                                            pageText += '\n';
                                        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !text.startsWith(' ')) {
                                            // Add space between words on same line if explicit space missing
                                            pageText += ' ';
                                        }

                                        pageText += text;
                                        lastY = currentY;
                                    }
                                });

                                if (pageText.trim()) {
                                    // Convert plain text page to HTML paragraphs
                                    const paragraphs = pageText.split('\n').filter(line => line.trim());
                                    const pageHtml = paragraphs.map(p => {
                                        // Very basic heading detection based on length or capitalization could be added here
                                        // For now, stick to paragraphs to ensure content visibility
                                        return `<p>${p}</p>`;
                                    }).join('');

                                    htmlContent += pageHtml;
                                    fullText += pageText + '\n\n';
                                }
                            }
                        } catch (pageError) {
                            console.warn(`Error reading page ${i}:`, pageError);
                        }
                    }

                    if (!fullText.trim() && !htmlContent.trim()) {
                        throw new Error('Could not extract text from PDF. The PDF might be image-based or protected.');
                    }

                    setContent(fullText);
                    setHtmlContent(htmlContent || fullText.split('\n\n').filter(p => p.trim()).map(para => `<p>${para.trim()}</p>`).join(''));
                    setIsLoading(false);
                } catch (pdfError) {
                    console.error('PDF parsing error:', pdfError);
                    setError(`Failed to parse PDF: ${pdfError.message || 'The file might be corrupted, password-protected, or image-based. Please try a different PDF or paste the text manually.'}`);
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

    const handleContinue = () => {
        if (activeTab === 'paste' && !content.trim()) {
            setError('Please paste some content to continue');
            return;
        }
        if (activeTab === 'upload' && !file) {
            setError('Please upload a file to continue');
            return;
        }

        onContinue({
            content: activeTab === 'paste' ? content : content,
            contentHtml: activeTab === 'paste' ? content.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('') : htmlContent,
            file: activeTab === 'upload' ? file : null,
            inputType: activeTab,
        });
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
                        disabled={(activeTab === 'paste' && !content.trim()) || (activeTab === 'upload' && !file)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25"
                    >
                        Continue
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
