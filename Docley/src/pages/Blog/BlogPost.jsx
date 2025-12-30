import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { getPostBySlug, getPostById } from '../../services/blogService';
import { Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function BlogPost() {
    const { id } = useParams(); // Can be slug or UUID
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        loadPost();
    }, [id]);

    const loadPost = async () => {
        setIsLoading(true);
        setNotFound(false);
        try {
            // Try fetching by slug first, then by ID
            let data = await getPostBySlug(id);
            if (!data) {
                data = await getPostById(id);
            }

            if (data) {
                setPost(data);
            } else {
                setNotFound(true);
            }
        } catch (error) {
            console.error('Error loading post:', error);
            setNotFound(true);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white font-sans">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
                <Footer />
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Post not found</h1>
                    <Link to="/blog"><Button>Back to Blog</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />

            <article className="pt-20 pb-24">
                {/* Header */}
                <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center mb-12">
                    <Link to="/blog" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
                    </Link>
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
                        {post.tags && (
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                {post.tags.split(',')[0]}
                            </span>
                        )}
                        <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" /> {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" /> {getReadTime(post.content)}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                        {post.title}
                    </h1>
                </div>

                {/* Hero Image */}
                {post.cover_image && (
                    <div className="container mx-auto px-4 md:px-6 max-w-4xl mb-16">
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <div
                        className="prose prose-slate prose-lg mx-auto prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* CTA in blog */}
                    <div className="mt-16 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 text-center">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Want to fix these issues automatically?</h3>
                        <p className="text-slate-600 mb-6">Our AI Academic Transformer scans your work for these exact problems.</p>
                        <Link to="/signup">
                            <Button className="shadow-lg shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white">
                                Try Academic Transformer Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
}

