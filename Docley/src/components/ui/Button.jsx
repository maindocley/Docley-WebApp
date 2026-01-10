import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'default',
    children,
    isLoading,
    disabled,
    ...props
}, ref) => {

    const variants = {
        primary: "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 border-transparent",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent",
        link: "bg-transparent text-indigo-600 hover:underline border-transparent p-0 h-auto",
        outline: "bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800 border-transparent"
    };

    const sizes = {
        default: "h-10 py-2 px-4 rounded-lg",
        sm: "h-9 px-3 rounded-md text-xs",
        lg: "h-12 px-8 rounded-xl text-lg font-medium",
        icon: "h-10 w-10 p-0 flex items-center justify-center rounded-lg"
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button };
