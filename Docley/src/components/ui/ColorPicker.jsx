import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

const COLORS = [
    { hex: '#000000', name: 'Black' },
    { hex: '#434343', name: 'Dark Gray 4' },
    { hex: '#666666', name: 'Dark Gray 3' },
    { hex: '#999999', name: 'Dark Gray 2' },
    { hex: '#b7b7b7', name: 'Dark Gray 1' },
    { hex: '#cccccc', name: 'Gray' },
    { hex: '#d9d9d9', name: 'Light Gray 3' },
    { hex: '#efefef', name: 'Light Gray 2' },
    { hex: '#f3f3f3', name: 'Light Gray 1' },
    { hex: '#ffffff', name: 'White' },
    { hex: '#980000', name: 'Red Berry' },
    { hex: '#ff0000', name: 'Red' },
    { hex: '#ff9900', name: 'Orange' },
    { hex: '#ffff00', name: 'Yellow' },
    { hex: '#00ff00', name: 'Green' },
    { hex: '#00ffff', name: 'Cyan' },
    { hex: '#4a86e8', name: 'Cornflower Blue' },
    { hex: '#0000ff', name: 'Blue' },
    { hex: '#9900ff', name: 'Purple' },
    { hex: '#ff00ff', name: 'Magenta' },
    { hex: '#e6b8af', name: 'Light Red Berry 3' },
    { hex: '#f4cccc', name: 'Light Red 3' },
    { hex: '#fce5cd', name: 'Light Orange 3' },
    { hex: '#fff2cc', name: 'Light Yellow 3' },
    { hex: '#d9ead3', name: 'Light Green 3' },
    { hex: '#d0e0e3', name: 'Light Cyan 3' },
    { hex: '#c9daf8', name: 'Light Cornflower Blue 3' },
    { hex: '#cfe2f3', name: 'Light Blue 3' },
    { hex: '#d9d2e9', name: 'Light Purple 3' },
    { hex: '#ead1dc', name: 'Light Magenta 3' },
];

export function ColorPicker({ onChange, value, type = 'text', onClose }) {
    return (
        <div className="p-2 grid grid-cols-10 gap-1 w-[220px]">
            {type === 'highlight' && (
                <button
                    onClick={() => {
                        onChange(null);
                        onClose?.();
                    }}
                    className="col-span-10 flex items-center justify-center p-1.5 text-xs border border-slate-200 rounded hover:bg-slate-50 mb-1"
                >
                    None
                </button>
            )}
            {COLORS.map((color) => (
                <button
                    key={color.hex}
                    onClick={() => {
                        onChange(color.hex);
                        onClose?.();
                    }}
                    className={cn(
                        "w-5 h-5 rounded-sm border border-slate-200 hover:scale-110 transition-transform relative flex items-center justify-center",
                        value === color.hex && "ring-2 ring-indigo-500 ring-offset-1 z-10"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                >
                    {value === color.hex && (
                        <Check className={cn(
                            "w-3 h-3",
                            ['#ffffff', '#f3f3f3', '#efefef'].includes(color.hex) ? "text-black" : "text-white"
                        )} />
                    )}
                </button>
            ))}
        </div>
    );
}
