import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { getPublishedPosts } from '../../services/blogService';
import { Calendar, User, Clock, ArrowRight, Loader2, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export default function BlogList() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const data = await getPublishedPosts();
            setPosts(data || []);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to estimate read time from content
    const getReadTime = (content) => {
        if (!content) return '2 min read';
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        return `${minutes} min read`;
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={cn(
            "min-h-screen font-sans transition-colors duration-300",
            isDark ? "bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" : "bg-slate-50"
        )}>
            <Navbar />

            <div className="py-20 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className={cn(
                            "text-4xl font-bold mb-4",
                            isDark ? "text-white" : "text-slate-900"
                        )}>
                            Academic Insights
                        </h1>
                        <p className={cn(
                            "text-xl max-w-2xl mx-auto",
                            isDark ? "text-slate-300" : "text-slate-600"
                        )}>
                            Tips, tricks, and strategies to master university writing and productivity.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className={cn(
                                "h-8 w-8 animate-spin",
                                isDark ? "text-orange-400" : "text-orange-500"
                            )} />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className={cn(
                            "text-center py-20 rounded-2xl border-2 border-dashed",
                            isDark ? "border-white/20" : "border-slate-300"
                        )}>
                            <FileText className={cn(
                                "h-16 w-16 mx-auto mb-4",
                                isDark ? "text-slate-600" : "text-slate-300"
                            )} />
                            <h3 className={cn(
                                "text-xl font-semibold mb-2",
                                isDark ? "text-white" : "text-slate-900"
                            )}>
                                No posts yet
                            </h3>
                            <p className={cn(
                                isDark ? "text-slate-400" : "text-slate-500"
                            )}>
                                Check back soon for new articles!
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <Link to={`/blog/${post.slug || post.id}`} key={post.id} className="group">
                                    <Card className={cn(
                                        "h-full overflow-hidden hover:shadow-xl transition-shadow duration-300",
                                        isDark
                                            ? "bg-white/5 border-white/10 hover:bg-white/10"
                                            : "border-slate-200"
                                    )}>
                                        {post.cover_image && (
                                            <div className="h-48 overflow-hidden">
                                                <img
                                                    src={post.cover_image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-6">
                                            <div className={cn(
                                                "flex items-center gap-4 text-xs mb-4",
                                                isDark ? "text-slate-400" : "text-slate-500"
                                            )}>
                                                {post.tags && (
                                                    <span className={cn(
                                                        "px-2 py-1 rounded-full font-medium",
                                                        isDark
                                                            ? "bg-orange-500/20 text-orange-300"
                                                            : "bg-indigo-50 text-indigo-700"
                                                    )}>
                                                        {post.tags.split(',')[0]}
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" /> {getReadTime(post.content)}
                                                </span>
                                            </div>

                                            <h2 className={cn(
                                                "text-xl font-bold mb-3 transition-colors",
                                                isDark
                                                    ? "text-white group-hover:text-orange-400"
                                                    : "text-slate-900 group-hover:text-orange-600"
                                            )}>
                                                {post.title}
                                            </h2>

                                            <div className={cn(
                                                "flex items-center justify-between text-sm mt-auto pt-4 border-t",
                                                isDark ? "border-white/10" : "border-slate-100"
                                            )}>
                                                <div className={cn(
                                                    "flex items-center",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    <Calendar className="h-3 w-3 mr-1" /> {formatDate(post.created_at)}
                                                </div>
                                                <div className={cn(
                                                    "flex items-center font-medium opacity-0 group-hover:opacity-100 transition-opacity",
                                                    isDark ? "text-orange-400" : "text-orange-600"
                                                )}>
                                                    Read <ArrowRight className="h-3 w-3 ml-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

