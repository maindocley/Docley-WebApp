import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import HTMLtoDOCX from 'html-to-docx/dist/html-to-docx.esm.js';

/**
 * Export the editor content to a PDF file.
 */
export const exportToPDF = async (element, fileName = 'document.pdf') => {
    if (!element) {
        console.error('PDF Export Error: No element provided');
        return;
    }

    console.log('Initiating PDF Export for:', fileName);

    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '816px'; // A4 Width
    container.style.backgroundColor = 'white';

    // Copy all styles from the original element
    const clone = element.cloneNode(true);

    // Style sanitization logic to handle Tailwind v4 oklch colors
    const sanitizeElement = (node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        // Use computed style to find colors inherited from classes
        const computed = window.getComputedStyle(node);
        const colorProps = ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'textDecorationColor', 'fill', 'stroke'];

        colorProps.forEach(prop => {
            const value = computed[prop];
            if (value && (value.includes('oklch') || value.includes('oklab') || value.includes('var('))) {
                // Force a safe fallback.
                node.style[prop] = value.includes('color') ? '#1e293b' : (prop === 'backgroundColor' ? 'transparent' : '#64748b');
            }
        });

        const shadow = computed.boxShadow;
        if (shadow && (shadow.includes('oklch') || shadow.includes('oklab'))) {
            node.style.boxShadow = 'none';
        }

        Array.from(node.children).forEach(sanitizeElement);
    };

    // Attach to DOM first so getComputedStyle works correctly
    container.appendChild(clone);
    document.body.appendChild(container);

    // Apply deep sanitization
    try {
        sanitizeElement(clone);
    } catch (e) {
        console.warn('Style sanitization encountered a node it could not process:', e);
    }

    // Final safety: strip any remaining oklch strings from innerHTML
    clone.innerHTML = clone.innerHTML.replace(/oklch\([^)]+\)/g, '#64748b');

    // Remove any transforms or styles that might interfere
    clone.style.transform = 'none';
    clone.style.margin = '0';

    const opt = {
        margin: [0, 0, 0, 0],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 816,
        },
        jsPDF: { unit: 'px', format: [816, 1123], orientation: 'portrait' },
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
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};

/**
 * Export the editor content to a Word (.docx) file.
 */
export const exportToWord = async (htmlContent, fileName = 'document.docx', options = {}) => {
    console.log('Initiating Word Export for:', fileName);

    if (typeof HTMLtoDOCX !== 'function') {
        console.error('HTMLtoDOCX is not a function. Type found:', typeof HTMLtoDOCX);
        throw new Error('Word library (html-to-docx) not correctly loaded');
    }
    const { title = 'Document', description = '', lastModifiedBy = 'Docley' } = options;

    const docxContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 12pt; }
                h1 { font-size: 16pt; font-weight: bold; margin-bottom: 12pt; }
                p { margin-bottom: 10pt; }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;

    try {
        const fileBuffer = await HTMLtoDOCX(docxContent, null, {
            title,
            description,
            lastModifiedBy,
            margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        });

        // HTMLtoDOCX returns a Blob in the browser
        const blob = fileBuffer instanceof Blob ? fileBuffer : new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link); // Required for some browsers
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Word Export successful');
    } catch (error) {
        console.error('Word Export failed details:', error);
        throw error;
    }
};
