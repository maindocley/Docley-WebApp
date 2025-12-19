import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EDITOR_CONFIG } from '../editorConfig';

export const Pagination = Extension.create({
    name: 'pagination',

    addOptions() {
        return {
            pageWidth: EDITOR_CONFIG.PAGE_WIDTH,
            pageHeight: EDITOR_CONFIG.PAGE_HEIGHT,
            margins: EDITOR_CONFIG.DEFAULT_MARGINS,
            showPageNumbers: true,
            pageNumberPosition: 'footer-right', // 'header-right', 'footer-center', 'footer-right'
        };
    },

    addProseMirrorPlugins() {
        const extension = this;
        const { pageWidth, pageHeight, margins } = this.options;

        return [
            new Plugin({
                key: new PluginKey('pagination'),
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, oldState) {
                        return oldState; // We'll update decorations in the view layer for accurate measurements
                    },
                },
                props: {
                    decorations(state) {
                        const { doc } = state;
                        const decorations = [];
                        let currentHeight = margins.top;
                        let pageCount = 1;

                        // Add Initial Page Header (Page 1)
                        decorations.push(
                            Decoration.widget(0, () => {
                                const div = document.createElement('div');
                                div.className = 'page-header first-page';
                                div.style.padding = `${margins.top / 2}px ${margins.right}px 0 ${margins.left}px`;
                                div.innerHTML = `
                                    <div class="header-content">Header</div>
                                    ${extension.options.showPageNumbers && extension.options.pageNumberPosition === 'header-right' ? `<span class="page-number">Page 1</span>` : ''}
                                `;
                                return div;
                            })
                        );

                        doc.descendants((node, pos) => {
                            if (node.isBlock) {
                                // Estimate node height
                                const nodeHeight = node.textContent.length > 0
                                    ? Math.ceil(node.textContent.length / 80) * 24 + 16
                                    : 24;

                                if (currentHeight + nodeHeight > pageHeight - margins.bottom) {
                                    // Current page is finished
                                    const footerPage = pageCount;
                                    pageCount++;

                                    decorations.push(
                                        Decoration.widget(pos, () => {
                                            const div = document.createElement('div');
                                            div.className = 'page-break-container';
                                            div.innerHTML = `
                                                <div class="page-footer" style="padding: 0 ${margins.right}px ${margins.bottom / 2}px ${margins.left}px">
                                                    <div class="footer-content">Footer</div>
                                                    ${extension.options.showPageNumbers && extension.options.pageNumberPosition.startsWith('footer') ? `<span class="page-number">Page ${footerPage}</span>` : ''}
                                                </div>
                                                <div class="page-gap"></div>
                                                <div class="page-header" style="padding: ${margins.top / 2}px ${margins.right}px 0 ${margins.left}px">
                                                    <div class="header-content">Header</div>
                                                    ${extension.options.showPageNumbers && extension.options.pageNumberPosition === 'header-right' ? `<span class="page-number">Page ${pageCount}</span>` : ''}
                                                </div>
                                            `;
                                            return div;
                                        })
                                    );
                                    currentHeight = margins.top + nodeHeight;
                                } else {
                                    currentHeight += nodeHeight;
                                }
                            }
                            return false;
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});
