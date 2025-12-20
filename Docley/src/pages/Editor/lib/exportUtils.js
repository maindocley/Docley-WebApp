import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Convert oklch color to RGB hex
 */
function oklchToRgb(oklchString) {
    // If it's already a hex color, return it
    if (oklchString.startsWith('#')) {
        return oklchString;
    }
    
    // If it's rgb/rgba, return it
    if (oklchString.startsWith('rgb')) {
        return oklchString;
    }
    
    // Default fallback for oklch (convert to dark gray)
    return '#1e293b';
}

/**
 * Sanitize CSS to remove oklch colors and convert to RGB
 */
function sanitizeStyles(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    
    // Get computed styles
    const computed = window.getComputedStyle(element);
    const colorProps = [
        'color', 'background-color', 'border-color',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'text-decoration-color', 'fill', 'stroke'
    ];
    
    colorProps.forEach(prop => {
        try {
            const value = computed.getPropertyValue(prop);
            if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('var('))) {
                const rgbColor = oklchToRgb(value);
                element.style.setProperty(prop, rgbColor, 'important');
            }
        } catch (e) {
            // Ignore errors
        }
    });
    
    // Recursively sanitize children
    Array.from(element.children).forEach(child => sanitizeStyles(child));
}

/**
 * Deep clean HTML to remove oklch references
 */
function deepCleanHTML(html) {
    return html
        // Remove oklch/oklab color functions
        .replace(/oklch\([^)]+\)/gi, '#1e293b')
        .replace(/oklab\([^)]+\)/gi, '#1e293b')
        // Remove CSS variables
        .replace(/var\(--[^)]+\)/gi, '#1e293b')
        // Clean up rgba with alpha 0
        .replace(/rgba?\([^)]*,\s*0\)/g, 'transparent')
        // Remove any remaining oklch references in style attributes
        .replace(/style="[^"]*oklch[^"]*"/gi, (match) => {
            return match.replace(/oklch\([^)]+\)/gi, '#1e293b');
        });
}

/**
 * Export the editor content to a PDF file.
 */
export const exportToPDF = async (element, fileName = 'document.pdf') => {
    if (!element) {
        console.error('PDF Export Error: No element provided');
        throw new Error('Editor element not found');
    }

    console.log('Initiating PDF Export for:', fileName);

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '816px'; // A4 Width
    container.style.backgroundColor = 'white';
    container.style.padding = '0';
    container.style.margin = '0';

    // Clone the editor content
    const clone = element.cloneNode(true);
    
    // Deep sanitize styles before adding to container
    sanitizeStyles(clone);
    
    // Clean HTML content
    clone.innerHTML = deepCleanHTML(clone.innerHTML);

    // Remove problematic styles
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.padding = '0';
    clone.style.boxShadow = 'none';
    clone.style.backgroundColor = 'white';
    clone.style.position = 'relative';
    clone.style.display = 'block';
    clone.style.width = '816px';

    container.appendChild(clone);
    document.body.appendChild(container);

    // Wait for fonts/images to load
    await new Promise(resolve => setTimeout(resolve, 100));

    const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 816,
            height: undefined, // Auto height
            backgroundColor: '#ffffff',
            removeContainer: true,
            onclone: (clonedDoc) => {
                // Remove all stylesheets that might contain oklch
                const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
                styles.forEach(s => s.remove());

                // Inject clean essential styles
                const essentialStyle = clonedDoc.createElement('style');
                essentialStyle.innerHTML = `
                    * {
                        color-scheme: light !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body, html {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .ProseMirror {
                        background: white !important;
                        padding: 96px !important;
                        width: 816px !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        color: #1e293b !important;
                    }
                    p {
                        margin-bottom: 1em;
                        line-height: 1.5;
                        color: #1e293b !important;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        color: #1e293b !important;
                        font-weight: bold;
                    }
                    .page-break-container {
                        margin: 0 -96px;
                        width: calc(100% + 192px);
                    }
                    .page-gap {
                        height: 48px;
                        background-color: #f1f5f9;
                        border-top: 1px solid #e2e8f0;
                    }
                    .page-header, .page-footer {
                        height: 96px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        font-size: 11px;
                        color: #64748b;
                        font-family: sans-serif;
                    }
                    .page-number {
                        font-weight: 600;
                        color: #64748b;
                    }
                `;
                clonedDoc.head.appendChild(essentialStyle);

                // Sanitize all elements in cloned document
                const allElements = clonedDoc.querySelectorAll('*');
                allElements.forEach(el => {
                    sanitizeStyles(el);
                    // Clean style attribute
                    if (el.hasAttribute('style')) {
                        let style = el.getAttribute('style');
                        style = style.replace(/oklch\([^)]+\)/gi, '#1e293b');
                        style = style.replace(/oklab\([^)]+\)/gi, '#1e293b');
                        style = style.replace(/var\(--[^)]+\)/gi, '#1e293b');
                        el.setAttribute('style', style);
                    }
                });
            }
        },
        jsPDF: {
            unit: 'px',
            format: [816, 1123], // A4
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
        if (typeof html2pdf !== 'function') {
            throw new Error('PDF library (html2pdf) not correctly loaded');
        }

        const exporter = html2pdf().from(container).set(opt);
        await exporter.save();
        console.log('PDF Export successful');
    } catch (error) {
        console.error('PDF Export failed details:', error);
        throw error;
    } finally {
        // Cleanup
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};

/**
 * Convert HTML to DOCX paragraphs
 */
function htmlToDocxElements(htmlString) {
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
    function processBlockNode(node) {
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
                        runs.push(new TextRun(text));
                    }
                } else if (n.nodeType === Node.ELEMENT_NODE) {
                    const tag = n.tagName.toLowerCase();
                    const children = Array.from(n.childNodes);
                    
                    if (tag === 'strong' || tag === 'b') {
                        const text = n.textContent;
                        if (text.trim()) {
                            runs.push(new TextRun({ text, bold: true }));
                        }
                    } else if (tag === 'em' || tag === 'i') {
                        const text = n.textContent;
                        if (text.trim()) {
                            runs.push(new TextRun({ text, italics: true }));
                        }
                    } else if (tag === 'u') {
                        const text = n.textContent;
                        if (text.trim()) {
                            runs.push(new TextRun({ text, underline: {} }));
                        }
                    } else {
                        children.forEach(child => traverse(child));
                    }
                }
            }
            
            traverse(node);
            return runs.length > 0 ? runs : [new TextRun('')];
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
                const listItems = Array.from(node.querySelectorAll('li'))
                    .map(li => processBlockNode(li))
                    .filter(Boolean);
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
            case 'div':
                // Process div as paragraph if it contains text
                if (textRuns.length > 0 && textRuns[0].text) {
                    return new Paragraph({
                        children: textRuns,
                        spacing: { after: 120 }
                    });
                }
                // Otherwise process children
                const divChildren = Array.from(node.childNodes)
                    .map(processBlockNode)
                    .filter(Boolean);
                return divChildren.length > 0 ? divChildren : null;
            default:
                // For other block elements, process children
                const children = Array.from(node.childNodes)
                    .map(processBlockNode)
                    .filter(Boolean);
                return children.length > 0 ? children : null;
        }
    }

    // Process body children
    const body = doc.body;
    Array.from(body.childNodes).forEach(node => {
        const result = processBlockNode(node);
        if (result) {
            if (Array.isArray(result)) {
                elements.push(...result);
            } else {
                elements.push(result);
            }
        }
    });

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

    const { title = 'Document', description = 'Academic Document created with Docley' } = options;

    try {
        // Clean HTML content
        const cleanHTML = deepCleanHTML(htmlContent);
        
        // Convert HTML to DOCX elements
        const docxElements = htmlToDocxElements(cleanHTML);

        // Create DOCX document
        const doc = new Document({
            sections: [{
                properties: {},
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
