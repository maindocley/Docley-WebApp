import React from 'react';
import { cn } from '../../lib/utils';
import { Check, Trash2 } from 'lucide-react';

const COLORS = [
    // Theme Colors (Monochrome row)
    '#ffffff', '#000000', '#424242', '#757575', '#bdbdbd', '#eeeeee', '#f5f5f5', '#fafafa', '#e0e0e0', '#cfd8dc',
    // Row 1 (Reds)
    '#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c',
    // Row 2 (Purples)
    '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c',
    // Row 3 (Blues)
    '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1',
    // Row 4 (Greens)
    '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20',
    // Row 5 (Yellows/Oranges)
    '#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b', '#fdd835', '#fbc02d', '#f9a825', '#f57f17',
];

export function ColorPicker({ onChange, value, type = 'text', onClose }) {
    return (
        <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-[260px] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {type === 'text' ? 'Text Color' : 'Highlight Color'}
                </span>
                <button
                    onClick={() => {
                        onChange(null);
                        onClose?.();
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-colors"
                    title="Reset Color"
                >
                    <Eraser className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-10 gap-1">
                {COLORS.map((hex) => (
                    <button
                        key={hex}
                        onClick={() => {
                            onChange(hex);
                            onClose?.();
                        }}
                        className={cn(
                            "w-5 h-5 rounded-sm border border-slate-200/50 hover:scale-125 transition-all duration-200 relative flex items-center justify-center group",
                            value === hex && "ring-2 ring-indigo-500 ring-offset-1 z-10 scale-110"
                        )}
                        style={{ backgroundColor: hex }}
                        title={hex}
                    >
                        {value === hex && (
                            <Check className={cn(
                                "w-3 h-3 drop-shadow-sm",
                                isLight(hex) ? "text-slate-800" : "text-white"
                            )} />
                        )}
                        <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 ring-1 ring-inset ring-black/10 pointer-events-none" />
                    </button>
                ))}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex gap-2">
                <button
                    onClick={() => onClose?.()}
                    className="flex-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 py-1"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

// Fixed import for Eraser which was missing from basic lucide set sometimes
function Eraser({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.9-9.9c1-1 2.5-1 3.4 0l4.3 4.3c1 1 1 2.5 0 3.4L10.5 21" />
            <path d="m22 22-5-5" />
            <path d="m15 11 4.3 4.3" />
        </svg>
    );
}

function isLight(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
}
