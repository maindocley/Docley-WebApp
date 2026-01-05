import { cn } from '../../lib/utils';

/**
 * Official Docley Logo Component
 * Features gradient text with stylized D letter
 */
export function DocleyLogo({ className, size = 'default', showTagline = false, iconOnly = false }) {
    const sizeClasses = {
        sm: 'text-xl',
        default: 'text-2xl',
        lg: 'text-4xl',
    };

    const iconSizeClasses = {
        sm: 'h-8 w-8 text-lg',
        default: 'h-10 w-10 text-xl',
        lg: 'h-12 w-12 text-2xl',
    };

    if (iconOnly) {
        return (
            <div className={cn(
                "relative group flex-shrink-0",
                className
            )}>
                <div className={cn(
                    "flex items-center justify-center font-bold rounded-xl transition-all duration-300",
                    "bg-gradient-to-br from-orange-500 via-orange-600 to-blue-600",
                    "shadow-[0_0_15px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.5)]",
                    "group-hover:scale-105 group-hover:rotate-3",
                    iconSizeClasses[size] || iconSizeClasses.default
                )}>
                    <span className="text-white drop-shadow-md">D</span>
                    {/* Glossy overlay effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl pointer-events-none" />
                </div>
                {/* Subtle outer glow */}
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
        );
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Stylized D with gradient */}
            <div className={cn(
                'font-bold leading-none',
                sizeClasses[size] || sizeClasses.default
            )}>
                <span className="inline-block bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                    D
                </span>
            </div>
            
            {/* Gradient text for 'ocley' */}
            <span className={cn(
                'font-bold leading-none bg-gradient-to-r from-orange-500 via-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent',
                sizeClasses[size]
            )}>
                ocley
            </span>
            
            {showTagline && (
                <span className={cn(
                    'text-xs uppercase tracking-wider ml-2',
                    'text-slate-500 dark:text-slate-400'
                )}>
                    Academic Transformer
                </span>
            )}
        </div>
    );
}

