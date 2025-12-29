import { cn } from '../../lib/utils';

/**
 * Official Docley Logo Component
 * Features gradient text with stylized D letter
 */
export function DocleyLogo({ className, size = 'default', showTagline = false }) {
    const sizeClasses = {
        small: 'text-xl',
        default: 'text-2xl',
        large: 'text-4xl',
    };

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Stylized D with gradient */}
            <div className={cn(
                'font-bold leading-none',
                sizeClasses[size]
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

