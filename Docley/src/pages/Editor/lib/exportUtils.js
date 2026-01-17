import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, Media, Header } from 'docx';

/**
 * Semantic Block Model for PDF Rendering
 * This replaces the basic text stripping with a model that understands document structure.
 */
function parseContentToBlocks(html) {
    if (!html) return [];

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const blocks = [];

    function processInline(node) {
        const runs = [];
        node.childNodes.forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                if (child.textContent) {
                    runs.push({ text: child.textContent, bold: false });
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tag = child.tagName.toLowerCase();
                const isBold = tag === 'strong' || tag === 'b';

                // If nested, we flatten for now or recurse
                if (child.childNodes.length > 0) {
                    const nestedRuns = processInline(child);
                    nestedRuns.forEach(nr => {
                        runs.push({ ...nr, bold: isBold || nr.bold });
                    });
                } else if (child.innerText) {
                    runs.push({ text: child.innerText, bold: isBold });
                }
            }
        });
        return runs;
    }

    const childNodes = Array.from(temp.childNodes);
    childNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const tag = node.tagName.toLowerCase();

        if (/^h[1-6]$/.test(tag)) {
            blocks.push({
                type: 'heading',
                level: parseInt(tag.substring(1)),
                text: node.innerText.trim()
            });
        } else if (tag === 'p') {
            const runs = processInline(node);
            if (runs.length > 0) {
                blocks.push({ type: 'paragraph', runs });
            }
        } else if (tag === 'ul' || tag === 'ol') {
            const items = Array.from(node.querySelectorAll('li')).map(li => {
                return { runs: processInline(li) };
            });
            if (items.length > 0) {
                blocks.push({ type: 'list', items, ordered: tag === 'ol' });
            }
        }
    });

    return blocks;
}

/**
 * Export the editor content to a PDF file using structured block rendering.
 */
export const exportToPDF = async (element, fileName = 'document.pdf', options = {}) => {
    const { margins, headerText } = options;

    if (!element) {
        throw new Error('Editor content not found');
    }

    const blocks = parseContentToBlocks(element.innerHTML);
    console.log('[PDF Export] Blocks parsed:', blocks.length);

    if (blocks.length === 0) {
        throw new Error('Cannot export empty document. Please wait for AI to finish or add some text.');
    }

    try {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = margins?.left ? (margins.left * 0.75) : 72;
        const marginY = margins?.top ? (margins.top * 0.75) : 72;
        const marginBottom = margins?.bottom ? (margins.bottom * 0.75) : 72;
        const maxLineWidth = pageWidth - (marginX * 2);

        let cursorY = marginY;

        const addHeader = () => {
            if (headerText) {
                const prevFont = doc.getFont().fontName;
                const prevSize = doc.getFontSize();
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(150);
                doc.text(headerText, pageWidth / 2, 40, { align: 'center' });
                doc.setFont(prevFont, 'normal');
                doc.setFontSize(prevSize);
                doc.setTextColor(30);
            }
        };

        const checkPageBreak = (needed) => {
            if (cursorY + needed > pageHeight - marginBottom) {
                doc.addPage();
                cursorY = marginY;
                addHeader();
                return true;
            }
            return false;
        };

        addHeader();

        blocks.forEach(block => {
            if (block.type === 'heading') {
                const sizes = { 1: 22, 2: 18, 3: 16, 4: 14, 5: 13, 6: 12 };
                const size = sizes[block.level] || 12;

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(size);

                const lines = doc.splitTextToSize(block.text, maxLineWidth);
                const blockHeight = lines.length * size * 1.2;

                checkPageBreak(blockHeight + 20);
                cursorY += 10; // Space before

                lines.forEach(line => {
                    doc.text(line, marginX, cursorY);
                    cursorY += size * 1.2;
                });

                cursorY += 10; // Space after
            } else if (block.type === 'paragraph' || block.type === 'list') {
                const renderRuns = (runs, indent = 0) => {
                    doc.setFontSize(12);
                    let currentX = marginX + indent;
                    const lineHeight = 12 * 1.5;

                    // Group runs into lines manually to handle bold transitions
                    let currentLine = [];
                    let currentLineWidth = 0;

                    const flushLine = () => {
                        if (currentLine.length === 0) return;

                        checkPageBreak(lineHeight);
                        let drawX = marginX + indent;

                        currentLine.forEach(run => {
                            doc.setFont('helvetica', run.bold ? 'bold' : 'normal');
                            doc.text(run.text, drawX, cursorY);
                            drawX += doc.getTextWidth(run.text);
                        });

                        cursorY += lineHeight;
                        currentLine = [];
                        currentLineWidth = 0;
                    };

                    runs.forEach(run => {
                        const words = run.text.split(/(\s+)/);
                        words.forEach(word => {
                            doc.setFont('helvetica', run.bold ? 'bold' : 'normal');
                            const wordWidth = doc.getTextWidth(word);

                            if (currentLineWidth + wordWidth > maxLineWidth - indent) {
                                flushLine();
                                // If the word itself is wider than line, we force it (unlikely with words)
                            }

                            currentLine.push({ text: word, bold: run.bold });
                            currentLineWidth += wordWidth;
                        });
                    });
                    flushLine();
                };

                if (block.type === 'paragraph') {
                    renderRuns(block.runs);
                    cursorY += 6; // Paragraph spacing
                } else if (block.type === 'list') {
                    block.items.forEach((item, index) => {
                        const marker = block.ordered ? `${index + 1}. ` : '• ';
                        const markerWidth = 15;

                        checkPageBreak(18);
                        doc.setFont('helvetica', 'normal');
                        doc.text(marker, marginX + 5, cursorY);

                        renderRuns(item.runs, markerWidth);
                    });
                    cursorY += 6;
                }
            }
        });

        const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        doc.save(finalFileName);
        console.log('[PDF Export] Success');
    } catch (error) {
        console.error('[PDF Export] Critical rendering failure:', error);
        throw new Error('PDF Generation Failed: ' + error.message);
    }
};


/**
 * Helper to fetch image and return as buffer/unit8array
 */
async function fetchImageAsBuffer(url) {
    try {
        if (url.startsWith('data:')) {
            const base64Content = url.split(',')[1];
            const binaryString = window.atob(base64Content);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        console.error('Error fetching image for DOCX:', error);
        return null;
    }
}

/**
 * Convert HTML to DOCX paragraphs
 */
async function htmlToDocxElements(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const elements = [];

    /**
     * Process inline nodes (text formatting)
     */
    function processInlineNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (text.trim()) {
                return text;
            }
            return '';
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const tagName = node.tagName.toLowerCase();
        const children = Array.from(node.childNodes)
            .map(processInlineNode)
            .filter(Boolean)
            .join('');

        if (!children && !node.textContent.trim()) {
            return '';
        }

        const text = children || node.textContent;

        switch (tagName) {
            case 'strong':
            case 'b':
                return { text, bold: true };
            case 'em':
            case 'i':
                return { text, italics: true };
            case 'u':
                return { text, underline: {} };
            case 'mark':
            case 'highlight':
                return { text, highlight: 'yellow' };
            default:
                return text;
        }
    }

    /**
     * Process block nodes (paragraphs, headings, etc.)
     */
    async function processBlockNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (!text) return null;
            return new Paragraph({
                children: [new TextRun(text)],
                spacing: { after: 120 }
            });
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const tagName = node.tagName.toLowerCase();

        // Process inline children for formatting
        function getTextRuns(node) {
            const runs = [];

            function traverse(n) {
                if (n.nodeType === Node.TEXT_NODE) {
                    const text = n.textContent;
                    if (text.trim()) {
                        runs.push(new TextRun({ text, size: 24 })); // 12pt
                    }
                } else if (n.nodeType === Node.ELEMENT_NODE) {
                    const tag = n.tagName.toLowerCase();
                    const children = Array.from(n.childNodes);
                    const style = n.getAttribute('style') || '';
                    const fontSizeMatch = style.match(/font-size:\s*(\d+)pt/);
                    const size = fontSizeMatch ? parseInt(fontSizeMatch[1]) * 2 : 24;

                    if (tag === 'strong' || tag === 'b') {
                        const text = n.textContent;
                        if (text.trim()) {
                            runs.push(new TextRun({ text, bold: true, size }));
                        }
                    } else if (tag === 'em' || tag === 'i') {
                        const text = n.textContent;
                        if (text.trim()) {
                            runs.push(new TextRun({ text, italics: true, size }));
                        }
                    } else if (tag === 'u') {
                        const text = n.textContent;
                        if (text.trim()) {
                            runs.push(new TextRun({ text, underline: {}, size }));
                        }
                    } else {
                        children.forEach(child => traverse(child));
                    }
                }
            }

            traverse(node);
            return runs.length > 0 ? runs : [new TextRun({ text: '', size: 24 })];
        }

        const textRuns = getTextRuns(node);

        switch (tagName) {
            case 'h1':
                return new Paragraph({
                    children: textRuns,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 240 }
                });
            case 'h2':
                return new Paragraph({
                    children: textRuns,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 200 }
                });
            case 'h3':
                return new Paragraph({
                    children: textRuns,
                    heading: HeadingLevel.HEADING_3,
                    spacing: { after: 180 }
                });
            case 'h4':
            case 'h5':
            case 'h6':
                return new Paragraph({
                    children: textRuns,
                    heading: HeadingLevel.HEADING_3,
                    spacing: { after: 180 }
                });
            case 'p':
                return new Paragraph({
                    children: textRuns,
                    spacing: { after: 120 }
                });
            case 'li':
                return new Paragraph({
                    children: textRuns,
                    bullet: { level: 0 },
                    spacing: { after: 80 }
                });
            case 'ul':
            case 'ol':
                // Process list items
                const listItems = [];
                const items = Array.from(node.querySelectorAll('li'));
                for (const li of items) {
                    const res = await processBlockNode(li);
                    if (res) {
                        if (Array.isArray(res)) listItems.push(...res);
                        else listItems.push(res);
                    }
                }
                return listItems;
            case 'blockquote':
                return new Paragraph({
                    children: textRuns,
                    spacing: { before: 120, after: 120 }
                });
            case 'br':
                return new Paragraph({
                    children: [new TextRun('')],
                    spacing: { after: 120 }
                });
            case 'img':
                // Handle images - convert to ImageRun
                const imgSrc = node.getAttribute('src');
                const imgAlt = node.getAttribute('alt') || 'Image';

                if (imgSrc) {
                    const imageBuffer = await fetchImageAsBuffer(imgSrc);
                    if (imageBuffer) {
                        return new Paragraph({
                            children: [
                                new ImageRun({
                                    data: imageBuffer,
                                    transformation: {
                                        width: 500, // Fixed width for now, could be dynamic
                                        height: 300,
                                    },
                                }),
                            ],
                            spacing: { before: 200, after: 200 },
                            alignment: 'center',
                        });
                    }
                }

                return new Paragraph({
                    children: [new TextRun({ text: `[${imgAlt}]`, italics: true })],
                    spacing: { after: 120 }
                });
            case 'div':
                // Process div as paragraph if it contains text
                if (textRuns.length > 0 && textRuns[0].text) {
                    return new Paragraph({
                        children: textRuns,
                        spacing: { after: 120 }
                    });
                }
                // Otherwise process children
                const divChildren = [];
                for (const childNode of Array.from(node.childNodes)) {
                    const res = await processBlockNode(childNode);
                    if (res) {
                        if (Array.isArray(res)) divChildren.push(...res);
                        else divChildren.push(res);
                    }
                }
                return divChildren.length > 0 ? divChildren : null;
            default:
                // For other block elements, process children
                const otherChildren = [];
                for (const childNode of Array.from(node.childNodes)) {
                    const res = await processBlockNode(childNode);
                    if (res) {
                        if (Array.isArray(res)) otherChildren.push(...res);
                        else otherChildren.push(res);
                    }
                }
                return otherChildren.length > 0 ? otherChildren : null;
        }
    }

    // Process body children using a recursive async approach for element resolution
    const bodyChildren = Array.from(doc.body.childNodes);
    for (const node of bodyChildren) {
        const result = await processBlockNode(node);
        if (result) {
            if (Array.isArray(result)) {
                elements.push(...result);
            } else {
                elements.push(result);
            }
        }
    }

    // If no elements, add empty paragraph
    if (elements.length === 0) {
        elements.push(new Paragraph({ children: [new TextRun('')] }));
    }

    return elements;
}

/**
 * Export the editor content to a Word (.docx) file.
 */
export const exportToWord = async (htmlContent, fileName = 'document.docx', options = {}) => {
    console.log('Initiating Word Export for:', fileName);

    const {
        title = 'Document',
        description = 'Academic Document created with Docley',
        margins,
        headerText
    } = options;

    try {
        // Clean HTML content
        const cleanHTML = deepCleanHTML(htmlContent);

        // Convert HTML to DOCX elements
        const docxElements = await htmlToDocxElements(cleanHTML);

        // Create DOCX document
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: margins ? {
                            top: (margins.top / 96) * 1440, // convert px to twips (approx)
                            bottom: (margins.bottom / 96) * 1440,
                            left: (margins.left / 96) * 1440,
                            right: (margins.right / 96) * 1440,
                        } : {
                            top: 1440,
                            bottom: 1440,
                            left: 1440,
                            right: 1440,
                        }
                    }
                },
                headers: headerText ? {
                    default: new Header({
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: headerText, size: 18, color: "64748B" })],
                                alignment: "center",
                            }),
                        ],
                    }),
                } : {},
                children: docxElements
            }],
            title,
            description,
            creator: 'Docley',
            created: new Date()
        });

        // Generate blob
        const blob = await Packer.toBlob(doc);

        // Download file
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Word Export successful');
    } catch (error) {
        console.error('Word Export failed details:', error);
        throw error;
    }
};
