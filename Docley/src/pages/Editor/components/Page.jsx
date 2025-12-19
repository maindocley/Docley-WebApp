import React from 'react';
import { EDITOR_CONFIG } from '../editorConfig';
import { cn } from '../../../lib/utils';

export const Page = ({
    pageNumber,
    totalStats,
    header,
    footer,
    children,
    onHeaderChange,
    onFooterChange,
    showPageNumbers = true,
    pageNumberPosition = 'footer-center' // 'footer-left', 'footer-center', 'footer-right', 'header-right'
}) => {
    const { PAGE_WIDTH, PAGE_HEIGHT, DEFAULT_MARGINS } = EDITOR_CONFIG;

    const renderPageNumber = () => {
        if (!showPageNumbers) return null;
        return (
            <span className="text-xs text-slate-400 font-medium select-none">
                Page {pageNumber}
            </span>
        );
    };

    return (
        <div
            className="bg-white shadow-2xl mx-auto relative flex flex-col items-center group cursor-text transition-shadow duration-200 hover:shadow-indigo-100/50"
            style={{
                width: `${PAGE_WIDTH}px`,
                minHeight: `${PAGE_HEIGHT}px`,
                maxHeight: `${PAGE_HEIGHT}px`,
                padding: `0px`, // Padding is handled internally by slots
                overflow: 'hidden'
            }}
        >
            {/* Header Slot */}
            <div
                className="w-full flex items-center justify-between border-b border-transparent group-hover:border-slate-100 transition-colors px-[96px] pt-[32px] min-h-[96px]"
                style={{ paddingLeft: `${DEFAULT_MARGINS.left}px`, paddingRight: `${DEFAULT_MARGINS.right}px` }}
            >
                <div className="w-full text-xs text-slate-400 italic outline-none focus:text-slate-600 empty:before:content-['Add_header...'] empty:before:opacity-30">
                    {header}
                </div>
                {pageNumberPosition === 'header-right' && renderPageNumber()}
            </div>

            {/* Main Content Area */}
            <div
                className="flex-1 w-full"
                style={{
                    paddingLeft: `${DEFAULT_MARGINS.left}px`,
                    paddingRight: `${DEFAULT_MARGINS.right}px`,
                    paddingBottom: `0px` // Footer handles bottom spacing
                }}
            >
                {children}
            </div>

            {/* Footer Slot */}
            <div
                className="w-full flex items-end justify-between border-t border-transparent group-hover:border-slate-100 transition-colors px-[96px] pb-[32px] min-h-[96px]"
                style={{ paddingLeft: `${DEFAULT_MARGINS.left}px`, paddingRight: `${DEFAULT_MARGINS.right}px` }}
            >
                <div className="flex-1 text-xs text-slate-400 italic outline-none focus:text-slate-600 empty:before:content-['Add_footer...'] empty:before:opacity-30">
                    {footer}
                </div>

                {showPageNumbers && pageNumberPosition.startsWith('footer') && (
                    <div className={cn(
                        "absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none",
                        pageNumberPosition === 'footer-left' && "justify-start px-[96px]",
                        pageNumberPosition === 'footer-right' && "justify-end px-[96px]",
                    )}>
                        {renderPageNumber()}
                    </div>
                )}
            </div>

            {/* Visual Page Boundary Overlay (Optional hint) */}
            <div className="absolute inset-0 border border-slate-200 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
};
