import { useEffect, useState } from 'react';
import { MessageSquare, Star, Loader2, RefreshCw, Search, Filter, X } from 'lucide-react';
import { getAllFeedback } from '../../services/feedbackService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function FeedbackManager() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [feedback, setFeedback] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState(null);

    const loadFeedback = async () => {
        setIsLoading(true);
        try {
            const data = await getAllFeedback();
            setFeedback(data);
        } catch (err) {
            console.error('Failed to load feedback:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFeedback();
    }, []);

    const filteredFeedback = feedback.filter((item) => {
        const matchesSearch = item.message?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRating = ratingFilter === null || item.rating === ratingFilter;
        return matchesSearch && matchesRating;
    });

    const averageRating = feedback.length > 0
        ? (feedback.reduce((sum, item) => sum + (item.rating || 0), 0) / feedback.filter(f => f.rating).length).toFixed(1)
        : '0.0';

    const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: feedback.filter(f => f.rating === rating).length
    }));

    return (
        <div className={cn(
            'space-y-6 animate-in fade-in duration-300',
            isDark ? 'text-slate-100' : 'text-slate-900',
        )}>
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">User Feedback</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {feedback.length} total {feedback.length === 1 ? 'entry' : 'entries'}
                    </p>
                </div>
                <button
                    onClick={loadFeedback}
                    disabled={isLoading}
                    className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95 disabled:opacity-50',
                        isDark
                            ? 'bg-white/10 hover:bg-white/15 border border-white/10 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800',
                    )}
                >
                    <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={cn(
                    'rounded-xl p-5 border shadow-sm',
                    isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                )}>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                        Average Rating
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-3xl font-bold">{averageRating}</h3>
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-4 w-4",
                                        i < Math.round(parseFloat(averageRating))
                                            ? "fill-orange-500 text-orange-500"
                                            : isDark ? "text-slate-600" : "text-slate-300"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className={cn(
                    'rounded-xl p-5 border shadow-sm',
                    isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                )}>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                        Total Feedback
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{feedback.length}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {feedback.filter(f => f.rating).length} with ratings
                    </p>
                </div>

                <div className={cn(
                    'rounded-xl p-5 border shadow-sm',
                    isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
                )}>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide dark:text-slate-400">
                        Recent Activity
                    </p>
                    <h3 className="text-3xl font-bold mt-2">
                        {feedback.filter(f => {
                            const date = new Date(f.created_at);
                            const now = new Date();
                            const diffDays = (now - date) / (1000 * 60 * 60 * 24);
                            return diffDays <= 7;
                        }).length}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Last 7 days</p>
                </div>
            </div>

            {/* Filters */}
            <div className={cn(
                'rounded-xl p-4 border',
                isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
            )}>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search feedback..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                'w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500',
                                isDark
                                    ? 'bg-slate-800 border border-white/10 text-slate-100 placeholder:text-slate-500'
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400',
                            )}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRatingFilter(null)}
                                className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                                    ratingFilter === null
                                        ? isDark
                                            ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30'
                                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                                        : isDark
                                            ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                )}
                            >
                                All
                            </button>
                            {[5, 4, 3, 2, 1].map((rating) => (
                                <button
                                    key={rating}
                                    onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                                    className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
                                        ratingFilter === rating
                                            ? isDark
                                                ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30'
                                                : 'bg-orange-100 text-orange-700 border border-orange-200'
                                            : isDark
                                                ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                    )}
                                >
                                    <Star className={cn(
                                        "h-3 w-3",
                                        ratingFilter === rating
                                            ? "fill-orange-500 text-orange-500"
                                            : isDark ? "text-slate-400" : "text-slate-400"
                                    )} />
                                    {rating}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className={cn(
                'rounded-xl p-6 border shadow-sm',
                isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
            )}>
                <h3 className="text-lg font-bold mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                    {ratingCounts.map(({ rating, count }) => {
                        const percentage = feedback.length > 0 ? (count / feedback.length) * 100 : 0;
                        return (
                            <div key={rating} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-20">
                                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                                    <span className="text-sm font-medium">{rating}</span>
                                </div>
                                <div className="flex-1">
                                    <div className={cn(
                                        "h-2 rounded-full",
                                        isDark ? "bg-white/10" : "bg-slate-200"
                                    )}>
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-sm font-medium w-16 text-right",
                                    isDark ? "text-slate-300" : "text-slate-600"
                                )}>
                                    {count} ({percentage.toFixed(0)}%)
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Feedback List */}
            <div className={cn(
                'rounded-xl p-6 border shadow-sm',
                isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-slate-200',
            )}>
                <h3 className="text-lg font-bold mb-4">All Feedback</h3>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                    </div>
                ) : filteredFeedback.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className={cn("h-12 w-12 mx-auto mb-4", isDark ? "text-slate-600" : "text-slate-400")} />
                        <p className={cn("text-lg font-medium", isDark ? "text-slate-300" : "text-slate-600")}>
                            {searchQuery || ratingFilter ? 'No feedback matches your filters' : 'No feedback yet'}
                        </p>
                        <p className={cn("text-sm mt-2", isDark ? "text-slate-500" : "text-slate-500")}>
                            {searchQuery || ratingFilter
                                ? 'Try adjusting your search or filter criteria'
                                : 'User feedback will appear here when submitted.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFeedback.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "rounded-xl p-5 border transition-all hover:shadow-md",
                                    isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-slate-200 bg-slate-50 hover:bg-white"
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {item.rating && (
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={cn(
                                                                "h-4 w-4",
                                                                i < item.rating
                                                                    ? "fill-orange-500 text-orange-500"
                                                                    : isDark ? "text-slate-600" : "text-slate-300"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-full",
                                                isDark ? "bg-white/10 text-slate-300" : "bg-slate-200 text-slate-600"
                                            )}>
                                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-sm leading-relaxed",
                                            isDark ? "text-slate-200" : "text-slate-700"
                                        )}>
                                            {item.message}
                                        </p>
                                        {item.user_id && (
                                            <p className={cn(
                                                "text-xs mt-3",
                                                isDark ? "text-slate-500" : "text-slate-400"
                                            )}>
                                                User ID: {item.user_id.substring(0, 8)}...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

