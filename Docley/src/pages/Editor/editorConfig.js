export const EDITOR_CONFIG = {
    // A4 Dimensions at 96 DPI
    PAGE_WIDTH: 816, // 8.5in * 96
    PAGE_HEIGHT: 1123, // 11.69in * 96 (Standard A4 is 210mm x 297mm)

    // Page Rendering Constants
    PAGE_GAP: 32,
    PAGE_SHADOW: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

    // Default Margins (1 inch = 96px)
    DEFAULT_MARGINS: {
        top: 96,
        bottom: 96,
        left: 96,
        right: 96
    },

    // Academic Defaults
    DEFAULT_FONT_SIZE: '16',
    DEFAULT_LINE_HEIGHT: '1.5',
    DEFAULT_FONT_FAMILY: 'Arial',

    // Zoom presets
    ZOOM_LEVELS: [
        { label: '75%', value: 0.75 },
        { label: '90%', value: 0.9 },
        { label: '100%', value: 1.0 },
        { label: '110%', value: 1.1 },
        { label: '125%', value: 1.25 },
        { label: '150%', value: 1.5 }
    ]
};

